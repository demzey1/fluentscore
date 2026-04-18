import { type Address, getAddress, isAddress } from "viem";
import { z } from "zod";

import { getWalletProfileWithLatestSnapshot } from "@/lib/db/wallet-snapshots";
import { getFluentWalletScore, refreshWalletSnapshotOnDemand } from "@/lib/scoring/wallet-score";
import type { WalletDataState, WalletScoreResult } from "@/lib/scoring/types";

const maxAgeMinutesSchema = z.number().int().min(1).max(120).default(5);

const addressSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => isAddress(value), "Invalid EVM wallet address.")
  .transform((value) => getAddress(value));

const postScoreBodySchema = z.object({
  address: addressSchema,
  refresh: z.boolean().optional().default(true),
  maxAgeMinutes: maxAgeMinutesSchema.optional().default(5),
});

const scoreQuerySchema = z.object({
  refresh: z.boolean().optional().default(false),
  maxAgeMinutes: maxAgeMinutesSchema.optional().default(5),
});

const rawPayloadSchema = z
  .object({
    sourceHealth: z
      .object({
        explorer: z.enum(["ok", "degraded"]),
        rpc: z.enum(["ok", "degraded"]),
        warnings: z.array(z.string()),
      })
      .optional(),
  })
  .passthrough();

export class ApiRouteError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface FreshnessMetadata {
  queriedAt: string;
  ageSeconds: number;
  maxAgeMinutes: number;
  isFresh: boolean;
}

export interface ScoreApiPayload {
  address: string;
  chainId: number;
  queriedAt: string;
  calculatedAt: string;
  freshness: FreshnessMetadata;
  dataState: WalletDataState;
  summaryLabel: WalletScoreResult["summaryLabel"];
  reasons: string[];
  totalScore: number;
  breakdown: {
    transactionActivity: number;
    contractDiversity: number;
    consistency: number;
  };
  metrics: {
    transactionCount: number;
    uniqueContracts: number;
    activeDays: number;
  };
  sourceHealth: WalletScoreResult["sourceHealth"];
}

export interface WalletSnapshotApiPayload {
  wallet: {
    address: string;
    createdAt: string;
    updatedAt: string;
  };
  latestSnapshot: {
    queriedAt: string;
    firstSeenAt: string | null;
    lastActivityAt: string | null;
    transactionCount: number;
    uniqueContracts: number;
    activeDays: number;
    dataState: WalletDataState;
    sourceHealth: WalletScoreResult["sourceHealth"];
  };
  freshness: FreshnessMetadata;
}

function nowIso() {
  return new Date().toISOString();
}

function freshnessFromTimestamp(queriedAt: string, maxAgeMinutes: number): FreshnessMetadata {
  const queriedDate = new Date(queriedAt);
  const now = Date.now();
  const ageMs = Number.isFinite(queriedDate.getTime()) ? now - queriedDate.getTime() : 0;
  const ageSeconds = Math.max(0, Math.floor(ageMs / 1000));
  const maxAgeSeconds = maxAgeMinutes * 60;

  return {
    queriedAt,
    ageSeconds,
    maxAgeMinutes,
    isFresh: ageSeconds <= maxAgeSeconds,
  };
}

function deriveSnapshotState(input: {
  transactionCount: number;
  uniqueContracts: number;
  activeDays: number;
  sourceHealth: WalletScoreResult["sourceHealth"];
}): WalletDataState {
  if (input.sourceHealth.explorer === "degraded" && input.transactionCount === 0) {
    return "explorer_unavailable";
  }
  if (input.transactionCount === 0) {
    return "no_fluent_activity";
  }
  if (input.transactionCount <= 3 && input.uniqueContracts <= 1 && input.activeDays <= 2) {
    return "testnet_sparse";
  }
  return "ok";
}

function mapScorePayload(score: WalletScoreResult, maxAgeMinutes: number): ScoreApiPayload {
  return {
    address: score.address,
    chainId: score.chainId,
    queriedAt: score.queriedAt,
    calculatedAt: score.calculatedAt,
    freshness: freshnessFromTimestamp(score.queriedAt, maxAgeMinutes),
    dataState: score.dataState,
    summaryLabel: score.summaryLabel,
    reasons: score.reasons,
    totalScore: score.totalScore,
    breakdown: {
      transactionActivity: score.breakdown.activity,
      contractDiversity: score.breakdown.diversity,
      consistency: score.breakdown.consistency,
    },
    metrics: {
      transactionCount: score.metrics.transactionCount,
      uniqueContracts: score.metrics.uniqueContracts,
      activeDays: score.metrics.activeDays,
    },
    sourceHealth: score.sourceHealth,
  };
}

export function parseAddressParam(address: string): Address {
  const parsed = addressSchema.safeParse(address);
  if (!parsed.success) {
    throw new ApiRouteError(400, "INVALID_ADDRESS", "Invalid EVM wallet address.", {
      issues: parsed.error.issues,
    });
  }
  return parsed.data;
}

export function parseScoreQuery(searchParams: URLSearchParams) {
  const rawRefresh = searchParams.get("refresh");
  const rawMaxAge = searchParams.get("maxAgeMinutes");

  const parsed = scoreQuerySchema.safeParse({
    refresh: rawRefresh === "1" || rawRefresh === "true",
    maxAgeMinutes: rawMaxAge ? Number(rawMaxAge) : undefined,
  });

  if (!parsed.success) {
    throw new ApiRouteError(400, "INVALID_QUERY", "Invalid query parameters.", {
      issues: parsed.error.issues,
    });
  }

  return parsed.data;
}

export async function parsePostScoreBody(request: Request) {
  let jsonPayload: unknown;
  try {
    jsonPayload = await request.json();
  } catch {
    throw new ApiRouteError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const parsed = postScoreBodySchema.safeParse(jsonPayload);
  if (!parsed.success) {
    throw new ApiRouteError(400, "INVALID_BODY", "Invalid /api/score payload.", {
      issues: parsed.error.issues,
    });
  }

  return parsed.data;
}

export async function executeScoreFlow(input: {
  address: Address;
  refresh: boolean;
  maxAgeMinutes: number;
}): Promise<ScoreApiPayload> {
  try {
    const score = input.refresh
      ? await refreshWalletSnapshotOnDemand(input.address)
      : await getFluentWalletScore(input.address, {
          forceRefresh: false,
          maxAgeMinutes: input.maxAgeMinutes,
        });

    return mapScorePayload(score, input.maxAgeMinutes);
  } catch (error) {
    throw new ApiRouteError(503, "SCORING_UNAVAILABLE", "Unable to score wallet right now.", {
      message: error instanceof Error ? error.message : "Unknown scoring error.",
    });
  }
}

export async function getWalletSnapshotPayload(input: {
  address: Address;
  maxAgeMinutes: number;
}): Promise<WalletSnapshotApiPayload> {
  const profile = await getWalletProfileWithLatestSnapshot(input.address);
  if (!profile || profile.snapshots.length === 0) {
    throw new ApiRouteError(
      404,
      "WALLET_NOT_FOUND",
      "Wallet profile was not found. Score this wallet first to create a snapshot.",
    );
  }

  const latestSnapshot = profile.snapshots[0];
  const parsedRawPayload = rawPayloadSchema.safeParse(latestSnapshot.rawPayload);
  const sourceHealth =
    parsedRawPayload.success && parsedRawPayload.data.sourceHealth
      ? parsedRawPayload.data.sourceHealth
      : {
          explorer: "ok" as const,
          rpc: "ok" as const,
          warnings: [],
        };

  const dataState = deriveSnapshotState({
    transactionCount: latestSnapshot.txCount,
    uniqueContracts: latestSnapshot.uniqueContracts,
    activeDays: latestSnapshot.activeDays,
    sourceHealth,
  });

  return {
    wallet: {
      address: profile.address,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    },
    latestSnapshot: {
      queriedAt: latestSnapshot.createdAt.toISOString(),
      firstSeenAt: latestSnapshot.firstSeenAt ? latestSnapshot.firstSeenAt.toISOString() : null,
      lastActivityAt: latestSnapshot.lastActivityAt
        ? latestSnapshot.lastActivityAt.toISOString()
        : null,
      transactionCount: latestSnapshot.txCount,
      uniqueContracts: latestSnapshot.uniqueContracts,
      activeDays: latestSnapshot.activeDays,
      dataState,
      sourceHealth,
    },
    freshness: freshnessFromTimestamp(
      latestSnapshot.createdAt.toISOString(),
      input.maxAgeMinutes,
    ),
  };
}

export function buildErrorPayload(error: unknown) {
  if (error instanceof ApiRouteError) {
    return {
      status: error.status,
      body: {
        error: {
          code: error.code,
          message: error.message,
          details: error.details ?? null,
        },
        timestamp: nowIso(),
      },
    };
  }

  return {
    status: 500,
    body: {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected server error occurred.",
      },
      timestamp: nowIso(),
    },
  };
}
