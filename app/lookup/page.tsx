import { WalletLookupForm } from "@/components/wallet-lookup-form";

export default function WalletLookupPage() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-foreground text-lg font-semibold">Wallet lookup</h1>
        <p className="text-muted-foreground text-sm">
          Enter a Fluent Testnet wallet address to compute its current score snapshot.
        </p>
      </div>
      <WalletLookupForm />
    </div>
  );
}
