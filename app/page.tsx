import { WalletLookupForm } from "@/components/wallet-lookup-form";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-8 pt-8">
        <div className="flex flex-col gap-3">
          <p
            className="font-mono text-xs tracking-widest uppercase"
            style={{ color: "oklch(0.65 0.14 165)" }}
          >
            Fluent Testnet · chain 20994
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Analyze any address on Fluent Testnet.
          </h1>
          <p className="max-w-lg text-sm text-muted-foreground leading-relaxed">
            Derived entirely from on-chain activity — transactions, contract
            interactions, and usage patterns.
          </p>
        </div>

        <div className="w-full max-w-xl">
          <WalletLookupForm
            placeholder="0x…  wallet address"
            ctaLabel="Score Wallet"
          />
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <div className="border-t border-white/8" />

      {/* ── What it measures ─────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
          Measured from
        </h2>
        <div className="grid grid-cols-1 gap-px sm:grid-cols-3 border border-white/8 rounded-md overflow-hidden">
          {[
            {
              label: "Transaction activity",
              detail: "Volume and recency of txs sent from this address on Fluent Testnet",
            },
            {
              label: "Contract interactions",
              detail: "Breadth of unique smart contracts engaged with across the network",
            },
            {
              label: "On-chain consistency",
              detail: "Distinct active days — measures sustained vs one-time usage",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-2 bg-card px-5 py-5"
            >
              <span className="text-sm font-medium text-foreground">
                {item.label}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Data from Fluent Testnet RPC and Fluentscan. No other chains included.
        </p>
      </section>

    </div>
  );
}
