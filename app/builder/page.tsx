import { redirect } from "next/navigation";
import { isAddress } from "viem";

import { createRuleSetAction, updateRuleSetAction } from "@/app/builder/actions";
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
    const definition = eligibilityRuleDefinitionSchema.parse(selectedRule.definition);
    const score = await getFluentWalletScore(candidateAddress);
    const result = evaluateEligibilityRuleSet(definition, score);
    evaluation = {
      ...result,
      totalScore: score.totalScore,
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Builder Mode</h1>
          <p className="text-muted-foreground text-sm">
            Developer-only rule set management and eligibility evaluation.
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

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Rule Set</CardTitle>
            <CardDescription>
              Definition JSON must match eligibility conditions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createRuleSetAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Name</Label>
                <Input id="create-name" name="name" required maxLength={80} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description">Description</Label>
                <Input id="create-description" name="description" maxLength={300} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-definition">Definition JSON</Label>
                <Textarea
                  id="create-definition"
                  name="definition"
                  required
                  rows={7}
                  placeholder='{"minScore":60,"minTransactions":20}'
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked
                  className="accent-primary size-4"
                />
                Active
              </label>
              <Button type="submit" className="w-full">
                Create Rule Set
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evaluate Eligibility</CardTitle>
            <CardDescription>
              Run a Fluent wallet against a selected rule set.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action="/builder" method="get" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ruleSetId">Rule Set ID</Label>
                <Input
                  id="ruleSetId"
                  name="ruleSetId"
                  required
                  placeholder="Paste a rule set ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Wallet Address</Label>
                <Input id="address" name="address" required placeholder="0x..." />
              </div>
              <Button type="submit" className="w-full">
                Evaluate
              </Button>
            </form>

            {evaluation ? (
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Evaluation Result</p>
                  <Badge variant={evaluation.eligible ? "secondary" : "outline"}>
                    {evaluation.eligible ? "Eligible" : "Not Eligible"}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  Wallet score: {evaluation.totalScore}/100
                </p>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-green-700">Passed</p>
                  <ul className="text-muted-foreground list-disc space-y-1 pl-5">
                    {evaluation.passed.length > 0 ? (
                      evaluation.passed.map((item) => <li key={item}>{item}</li>)
                    ) : (
                      <li>No conditions passed.</li>
                    )}
                  </ul>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-red-700">Failed</p>
                  <ul className="text-muted-foreground list-disc space-y-1 pl-5">
                    {evaluation.failed.length > 0 ? (
                      evaluation.failed.map((item) => <li key={item}>{item}</li>)
                    ) : (
                      <li>No failed conditions.</li>
                    )}
                  </ul>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rule Sets</CardTitle>
          <CardDescription>Update existing rule definitions and activation status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ruleSets.length === 0 ? (
            <p className="text-muted-foreground text-sm">No rule sets created yet.</p>
          ) : (
            ruleSets.map((ruleSet) => (
              <form
                key={ruleSet.id}
                action={updateRuleSetAction}
                className="space-y-3 rounded-lg border p-4"
              >
                <input type="hidden" name="id" value={ruleSet.id} />
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${ruleSet.id}`}>Name</Label>
                    <Input
                      id={`name-${ruleSet.id}`}
                      name="name"
                      defaultValue={ruleSet.name}
                      required
                      maxLength={80}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`description-${ruleSet.id}`}>Description</Label>
                    <Input
                      id={`description-${ruleSet.id}`}
                      name="description"
                      defaultValue={ruleSet.description ?? ""}
                      maxLength={300}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`definition-${ruleSet.id}`}>Definition JSON</Label>
                  <Textarea
                    id={`definition-${ruleSet.id}`}
                    name="definition"
                    defaultValue={JSON.stringify(ruleSet.definition, null, 2)}
                    rows={6}
                    required
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={ruleSet.isActive}
                    className="accent-primary size-4"
                  />
                  Active
                </label>
                <Button type="submit">Save Changes</Button>
              </form>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
