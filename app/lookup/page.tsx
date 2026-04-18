import { WalletLookupForm } from "@/components/wallet-lookup-form";

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
    </div>
  );
}
