import { redirect } from "next/navigation";
import { isAddress } from "viem";
import Link from "next/link";

import { createRuleSetAction, updateRuleSetAction } from "@/app/builder/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  clearBuilderSession,
  requireBuilderSession,
} from "@/lib/auth/builder-session";
import { listRuleSets } from "@/lib/db/rules";
import { evaluateEligibilityRuleSet } from "@/lib/rules/engine";
import { eligibilityRuleDefinitionSchema } from "@/lib/rules/schema";
import { getFluentWalletScore } from "@/lib/scoring/wallet-score";

interface BuilderPageProps {
  searchParams: Promise<{
    status?: string;
    message?: string;
    ruleSetId?: string;
    address?: string;
  }>;
}

async function lockBuilderModeAction() {
  "use server";
  await clearBuilderSession();
  redirect("/builder-access");
}

const ruleExamples = [
  { label: "Min TX Count", example: '"minTransactions": 20' },
  { label: "Min Active Days", example: '"minActiveDays": 7' },
  { label: "Min Score", example: '"minScore": 50' },
  { label: "Min Contracts", example: '"minUniqueContracts": 5' },
  { label: "Has Deployed", example: '"minContractsDeployed": 1' },
];

export default async function BuilderPage({ searchParams }: BuilderPageProps) {
  await requireBuilderSession();

  const params = await searchParams;
  const ruleSets = await listRuleSets();

  const selectedRule = ruleSets.find((rule) => rule.id === params.ruleSetId);
  const candidateAddress = params.address?.trim();

  let evaluation:
    | {
        eligible: boolean;
        passed: string[];
        failed: string[];
        totalScore: number;
      }
    | undefined;

  if (selectedRule && candidateAddress && isAddress(candidateAddress)) {
    try {
      const definition = eligibilityRuleDefinitionSchema.parse(
        selectedRule.definition
      );
      const score = await getFluentWalletScore(candidateAddress);
      const result = evaluateEligibilityRuleSet(definition, score);
      evaluation = {
        ...result,
        totalScore: score.totalScore,
      };
    } catch {
      // Evaluation failed - will show no results
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Builder Mode
            </h1>
            <Badge
              variant="outline"
              className="border-warning/50 bg-warning/10 text-warning"
            >
              Developer Only
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Create and manage eligibility rule sets for wallet evaluation.
          </p>
        </div>
        <form action={lockBuilderModeAction} className="flex items-center gap-2">
          <Button variant="outline" type="submit" className="gap-2">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Lock Builder Mode
          </Button>
        </form>
      </div>

      {/* Status message */}
      {params.message && (
        <div
          className={`animate-fade-in rounded-lg border px-4 py-3 ${
            params.status === "error"
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-success/30 bg-success/10 text-success"
          }`}
        >
          <div className="flex items-center gap-2">
            {params.status === "error" ? (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            {params.message}
          </div>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create Rule Set */}
        <div className="rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Create Rule Set</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Define eligibility conditions using JSON format.
            </p>
          </div>

          <form action={createRuleSetAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                name="name"
                required
                maxLength={80}
                placeholder="e.g., Early Adopter Airdrop"
                className="bg-card/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Input
                id="create-description"
                name="description"
                maxLength={300}
                placeholder="Optional description..."
                className="bg-card/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-definition">Definition JSON</Label>
              <Textarea
                id="create-definition"
                name="definition"
                required
                rows={6}
                className="bg-card/50 font-mono text-sm"
                placeholder={`{
  "minScore": 60,
  "minTransactions": 20,
  "minActiveDays": 7
}`}
              />
            </div>

            {/* Rule examples */}
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Available Conditions
              </p>
              <div className="flex flex-wrap gap-2">
                {ruleExamples.map((rule) => (
                  <button
                    key={rule.label}
                    type="button"
                    className="rounded-md border border-border/50 bg-muted/30 px-2 py-1 font-mono text-xs transition-colors hover:border-primary/30 hover:bg-primary/5"
                    title={rule.example}
                  >
                    {rule.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked
                className="h-4 w-4 rounded border-border/50 bg-card/50 text-primary focus:ring-primary/20"
              />
              <span>Active</span>
            </label>

            <Button type="submit" className="w-full">
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Create Rule Set
            </Button>
          </form>
        </div>

        {/* Evaluate Eligibility */}
        <div className="rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Evaluate Eligibility</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Test a wallet against a rule set to check eligibility.
            </p>
          </div>

          <form action="/builder" method="get" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ruleSetId">Rule Set</Label>
              <select
                id="ruleSetId"
                name="ruleSetId"
                required
                defaultValue={params.ruleSetId || ""}
                className="h-10 w-full rounded-lg border border-border/50 bg-card/50 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select a rule set...</option>
                {ruleSets.map((rule) => (
                  <option key={rule.id} value={rule.id}>
                    {rule.name} {!rule.isActive && "(Inactive)"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Wallet Address</Label>
              <Input
                id="address"
                name="address"
                required
                defaultValue={params.address || ""}
                placeholder="0x..."
                className="bg-card/50 font-mono"
              />
            </div>

            <Button type="submit" className="w-full" variant="secondary">
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              Evaluate Wallet
            </Button>
          </form>

          {/* Evaluation result */}
          {evaluation && (
            <div className="mt-6 animate-fade-in rounded-lg border border-border/50 bg-muted/30 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium">Evaluation Result</h3>
                <Badge
                  variant="outline"
                  className={
                    evaluation.eligible
                      ? "border-success/50 bg-success/10 text-success"
                      : "border-destructive/50 bg-destructive/10 text-destructive"
                  }
                >
                  {evaluation.eligible ? "Eligible" : "Not Eligible"}
                </Badge>
              </div>

              <div className="mb-4 flex items-center gap-3 rounded-lg bg-card/50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-mono font-bold text-primary">
                  {evaluation.totalScore}
                </div>
                <div>
                  <p className="text-sm font-medium">Wallet Score</p>
                  <p className="text-xs text-muted-foreground">Out of 100</p>
                </div>
              </div>

              <div className="space-y-4">
                {evaluation.passed.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-success">
                      Passed Conditions
                    </p>
                    <ul className="space-y-1">
                      {evaluation.passed.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <svg
                            className="h-4 w-4 text-success"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {evaluation.failed.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-destructive">
                      Failed Conditions
                    </p>
                    <ul className="space-y-1">
                      {evaluation.failed.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <svg
                            className="h-4 w-4 text-destructive"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {candidateAddress && (
                <div className="mt-4 border-t border-border/30 pt-4">
                  <Link
                    href={`/score/${candidateAddress}`}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    View full wallet score
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rule Sets List */}
      <div className="rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Saved Rule Sets</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {ruleSets.length} rule set{ruleSets.length !== 1 ? "s" : ""}{" "}
              configured
            </p>
          </div>
        </div>

        {ruleSets.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/50 py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-muted-foreground/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
              />
            </svg>
            <p className="mt-4 text-sm text-muted-foreground">
              No rule sets created yet. Create your first rule set above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ruleSets.map((ruleSet) => (
              <form
                key={ruleSet.id}
                action={updateRuleSetAction}
                className="rounded-lg border border-border/50 bg-muted/20 p-4 transition-all hover:border-border"
              >
                <input type="hidden" name="id" value={ruleSet.id} />

                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        ruleSet.isActive ? "bg-success" : "bg-muted-foreground"
                      }`}
                    />
                    <span className="font-medium">{ruleSet.name}</span>
                  </div>
                  <code className="rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
                    {ruleSet.id}
                  </code>
                </div>

                <div className="mb-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${ruleSet.id}`}>Name</Label>
                    <Input
                      id={`name-${ruleSet.id}`}
                      name="name"
                      defaultValue={ruleSet.name}
                      required
                      maxLength={80}
                      className="bg-card/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`description-${ruleSet.id}`}>
                      Description
                    </Label>
                    <Input
                      id={`description-${ruleSet.id}`}
                      name="description"
                      defaultValue={ruleSet.description ?? ""}
                      maxLength={300}
                      className="bg-card/50"
                    />
                  </div>
                </div>

                <div className="mb-4 space-y-2">
                  <Label htmlFor={`definition-${ruleSet.id}`}>
                    Definition JSON
                  </Label>
                  <Textarea
                    id={`definition-${ruleSet.id}`}
                    name="definition"
                    defaultValue={JSON.stringify(ruleSet.definition, null, 2)}
                    rows={5}
                    required
                    className="bg-card/50 font-mono text-sm"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked={ruleSet.isActive}
                      className="h-4 w-4 rounded border-border/50 bg-card/50 text-primary focus:ring-primary/20"
                    />
                    <span>Active</span>
                  </label>
                  <Button type="submit" size="sm">
                    Save Changes
                  </Button>
                </div>
              </form>
            ))}
          </div>
        )}
      </div>

      {/* Footer notice */}
      <div className="rounded-lg border border-border/30 bg-muted/20 px-4 py-3 text-center text-sm text-muted-foreground">
        <svg
          className="mr-2 inline-block h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
        Builder Mode evaluates wallets using Fluent Testnet data. Testnet data
        may be reset periodically.
      </div>
    </div>
  );
}
