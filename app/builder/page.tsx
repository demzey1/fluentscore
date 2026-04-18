import { redirect } from "next/navigation";

import { saveActiveRuleSetAction } from "@/app/builder/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  clearBuilderSession,
  requireBuilderSession,
} from "@/lib/auth/builder-session";
import { listBuilderWalletHistory } from "@/lib/db/rules";

interface BuilderPageProps {
  searchParams: Promise<{
    status?: string;
    message?: string;
  }>;
}

async function lockBuilderModeAction() {
  "use server";
  await clearBuilderSession();
  redirect("/builder-access");
}

export default async function BuilderPage({ searchParams }: BuilderPageProps) {
  await requireBuilderSession();

  const params = await searchParams;
  const { activeRuleSet, wallets } = await listBuilderWalletHistory(250);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Builder Mode</h1>
          <p className="text-muted-foreground text-sm">
            Private threshold management and scored-wallet tracking.
          </p>
        </div>
        <form action={lockBuilderModeAction}>
          <Button variant="outline" type="submit">
            Lock Builder Mode
          </Button>
        </form>
      </div>

      {params.message ? (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            params.status === "error"
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-green-300 bg-green-50 text-green-700"
          }`}
        >
          {params.message}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Active Rule Set</CardTitle>
          <CardDescription>
            Configure minimum thresholds for transaction count, unique contracts, active days,
            and total score.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveActiveRuleSetAction} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Rule Name</Label>
                <Input
                  id="name"
                  name="name"
                  maxLength={80}
                  defaultValue={activeRuleSet?.name ?? "Builder Threshold Rule"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  maxLength={300}
                  defaultValue={activeRuleSet?.description ?? ""}
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minTransactionCount">Minimum transaction count</Label>
                <Input
                  id="minTransactionCount"
                  name="minTransactionCount"
                  type="number"
                  min={0}
                  defaultValue={activeRuleSet?.thresholds.minTransactionCount ?? 0}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minUniqueContracts">Minimum unique contracts</Label>
                <Input
                  id="minUniqueContracts"
                  name="minUniqueContracts"
                  type="number"
                  min={0}
                  defaultValue={activeRuleSet?.thresholds.minUniqueContracts ?? 0}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minActiveDays">Minimum active days</Label>
                <Input
                  id="minActiveDays"
                  name="minActiveDays"
                  type="number"
                  min={0}
                  defaultValue={activeRuleSet?.thresholds.minActiveDays ?? 0}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minTotalScore">Minimum total score</Label>
                <Input
                  id="minTotalScore"
                  name="minTotalScore"
                  type="number"
                  min={0}
                  defaultValue={activeRuleSet?.thresholds.minTotalScore ?? 0}
                  required
                />
              </div>
            </div>

            <Button type="submit">Save Active Rule Set</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scored Wallet History</CardTitle>
          <CardDescription>
            All previously scored wallets with pass/fail status against the active rule set.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {wallets.length === 0 ? (
            <p className="text-muted-foreground text-sm">No scored wallets recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Total Score</TableHead>
                  <TableHead>Tx</TableHead>
                  <TableHead>Contracts</TableHead>
                  <TableHead>Active Days</TableHead>
                  <TableHead>Queried</TableHead>
                  <TableHead>Rule Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallets.map((wallet) => (
                  <TableRow key={`${wallet.walletAddress}-${wallet.calculatedAt}`}>
                    <TableCell className="font-mono text-xs">{wallet.walletAddress}</TableCell>
                    <TableCell>{wallet.totalScore}</TableCell>
                    <TableCell>{wallet.score.metrics.transactionCount}</TableCell>
                    <TableCell>{wallet.score.metrics.uniqueContracts}</TableCell>
                    <TableCell>{wallet.score.metrics.activeDays}</TableCell>
                    <TableCell>{new Date(wallet.queriedAt).toLocaleString()}</TableCell>
                    <TableCell>
                      {wallet.rulePassed === null ? (
                        <Badge variant="outline">No active rule</Badge>
                      ) : wallet.rulePassed ? (
                        <Badge variant="secondary">Pass</Badge>
                      ) : (
                        <Badge variant="outline">Fail</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
