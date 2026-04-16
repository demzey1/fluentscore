import { WalletLookupForm } from "@/components/wallet-lookup-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WalletLookupPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Public Wallet Lookup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            Enter a Fluent wallet address to compute and view the latest score snapshot.
          </p>
          <WalletLookupForm />
        </CardContent>
      </Card>
    </div>
  );
}
