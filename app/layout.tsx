import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "FluentScore",
  description:
    "Wallet intelligence and eligibility scoring for Fluent Testnet activity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <AppProviders>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-6 py-12">
              {children}
            </main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
