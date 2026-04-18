import { WalletLookupForm } from "@/components/wallet-lookup-form";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col gap-8 pt-8">
        <div className="flex flex-col gap-3">
          <p
            className="font-mono text-xs tracking-widest uppercase"
            style={{ color: "oklch(0.65 0.14 165)" }}
          >
            Fluent Testnet - chain 20994
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Analyze any address on Fluent Testnet.
          </h1>
          <p className="text-muted-foreground max-w-lg text-sm leading-relaxed">
            Derived entirely from on-chain activity - transactions, contract interactions,
            and usage patterns.
          </p>
        </div>

        <div className="w-full max-w-xl">
          <WalletLookupForm placeholder="0x... wallet address" ctaLabel="Score Wallet" />
        </div>
      </section>

      <div className="border-t border-white/8" />

      <section className="flex flex-col gap-4">
        <h2 className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          Measured from
        </h2>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-white/8 sm:grid-cols-3">
          {[
            {
              label: "Transaction activity",
              detail:
                "Volume and recency of txs sent from this address on Fluent Testnet",
            },
            {
              label: "Contract interactions",
              detail:
                "Breadth of unique smart contracts engaged with across the network",
            },
            {
              label: "On-chain consistency",
              detail: "Distinct active days - measures sustained vs one-time usage",
            },
          ].map((item) => (
            <div key={item.label} className="bg-card flex flex-col gap-2 px-5 py-5">
              <span className="text-foreground text-sm font-medium">{item.label}</span>
              <p className="text-muted-foreground text-xs leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">
          Data from Fluent Testnet RPC and Fluentscan. No other chains included.
        </p>
      </section>
    </div>
  );
}
