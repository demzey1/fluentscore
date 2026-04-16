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
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "FluentScore | Wallet Intelligence for Fluent Apps",
  description: "Score Fluent wallets by ecosystem activity, builder signals, and custom eligibility rules. Built for the Fluent Testnet ecosystem.",
  keywords: ["Fluent", "wallet", "score", "eligibility", "blockchain", "testnet"],
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} bg-background`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AppProviders>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border/50 py-6">
              <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row">
                <p>FluentScore - Wallet intelligence for the Fluent ecosystem</p>
                <div className="flex items-center gap-4">
                  <a 
                    href="https://testnet.fluentscan.xyz/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-foreground"
                  >
                    FluentScan Explorer
                  </a>
                  <span className="text-border">|</span>
                  <span className="font-mono text-xs">Fluent Testnet</span>
                </div>
              </div>
            </footer>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
