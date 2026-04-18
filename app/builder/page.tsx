import { redirect } from "next/navigation";
import { isAddress } from "viem";

import {
  createRuleSetAction,
  deleteRuleSetAction,
  updateRuleSetAction,
} from "@/app/builder/actions";
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
import { evaluateWalletAgainstRuleSet, listRuleSets } from "@/lib/db/rules";

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

  const candidateAddress = params.address?.trim();
  const selectedRuleSetId = params.ruleSetId?.trim();

  let evaluation:
    | {
        passed: boolean;
        passedConditions: string[];
        failedConditions: string[];
        explanations: string[];
      }
    | undefined;

  if (selectedRuleSetId && candidateAddress && isAddress(candidateAddress)) {
    try {
      evaluation = await evaluateWalletAgainstRuleSet({
        ruleSetId: selectedRuleSetId,
        walletAddress: candidateAddress,
      });
    } catch {
      evaluation = undefined;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Builder Mode</h1>
          <p className="text-muted-foreground text-sm">
            Private rule authoring and evaluation for FluentScore.
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
              Provide conditions JSON using supported condition types.
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
                <Label htmlFor="create-conditions">Conditions JSON</Label>
                <Textarea
                  id="create-conditions"
                  name="conditionsJson"
                  required
                  rows={10}
                  placeholder={`[
  {"type":"MIN_TRANSACTION_COUNT","threshold":25},
  {"type":"MIN_TOTAL_SCORE","threshold":60}
]`}
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
              Evaluate a Fluent wallet against one rule set.
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
                  <Badge variant={evaluation.passed ? "secondary" : "outline"}>
                    {evaluation.passed ? "Pass" : "Fail"}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-green-700">Passed conditions</p>
                  <ul className="text-muted-foreground list-disc space-y-1 pl-5">
                    {evaluation.passedConditions.length > 0 ? (
                      evaluation.passedConditions.map((item) => <li key={item}>{item}</li>)
                    ) : (
                      <li>No conditions passed.</li>
                    )}
                  </ul>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-red-700">Failed conditions</p>
                  <ul className="text-muted-foreground list-disc space-y-1 pl-5">
                    {evaluation.failedConditions.length > 0 ? (
                      evaluation.failedConditions.map((item) => <li key={item}>{item}</li>)
                    ) : (
                      <li>No failed conditions.</li>
                    )}
                  </ul>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">Explanations</p>
                  <ul className="text-muted-foreground list-disc space-y-1 pl-5">
                    {evaluation.explanations.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
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
          <CardDescription>Create, edit, delete, and manage builder-only rule sets.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ruleSets.length === 0 ? (
            <p className="text-muted-foreground text-sm">No rule sets created yet.</p>
          ) : (
            ruleSets.map((ruleSet) => (
              <div key={ruleSet.id} className="space-y-3 rounded-lg border p-4">
                <form action={updateRuleSetAction} className="space-y-3">
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
                    <Label htmlFor={`conditions-${ruleSet.id}`}>Conditions JSON</Label>
                    <Textarea
                      id={`conditions-${ruleSet.id}`}
                      name="conditionsJson"
                      defaultValue={JSON.stringify(
                        ruleSet.conditions.map((condition) => ({
                          type: condition.type,
                          threshold: condition.threshold,
                        })),
                        null,
                        2,
                      )}
                      rows={9}
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
                <form action={deleteRuleSetAction}>
                  <input type="hidden" name="id" value={ruleSet.id} />
                  <Button type="submit" variant="outline">
                    Delete
                  </Button>
                </form>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
