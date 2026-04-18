import { WalletLookupForm } from "@/components/wallet-lookup-form";
<<<<<<< HEAD

export default function WalletLookupPage() {
  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground">Wallet lookup</h1>
        <p className="text-sm text-muted-foreground">
          Enter a Fluent Testnet wallet address to compute its current score
          snapshot.
        </p>
      </div>
      <WalletLookupForm />
=======
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
>>>>>>> 1027c6cb2035fb5a23c6ae5ffc1b1eeb07b835a9
    </div>
  );
}
