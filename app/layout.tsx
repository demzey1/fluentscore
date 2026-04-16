import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { SiteHeader } from "@/components/site-header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "FluentScore | Wallet Intelligence for Fluent Apps",
  description:
    "Score Fluent wallets by ecosystem activity, builder signals, and custom eligibility rules. Built for the Fluent Testnet.",
  keywords: ["Fluent", "Wallet", "Score", "Blockchain", "Web3", "Eligibility"],
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} bg-background`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <AppProviders>
          <div className="relative flex min-h-screen flex-col">
            {/* Background grid pattern */}
            <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(oklch(0.18_0_0)_1px,transparent_1px),linear-gradient(90deg,oklch(0.18_0_0)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />
            {/* Gradient orbs */}
            <div className="pointer-events-none fixed -left-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
            <div className="pointer-events-none fixed -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-[100px]" />
            <SiteHeader />
            <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
            <footer className="relative z-10 border-t border-border/50 py-6">
              <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
                <p>FluentScore - Wallet intelligence for Fluent Testnet</p>
                <div className="flex items-center gap-4">
                  <a
                    href="https://testnet.fluentscan.xyz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-foreground"
                  >
                    FluentScan
                  </a>
                  <a
                    href="https://testnet.fluent.xyz/dev-portal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-foreground"
                  >
                    Dev Portal
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
