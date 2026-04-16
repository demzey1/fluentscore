import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "FluentScore",
  description: "Wallet intelligence and eligibility engine for Fluent ecosystem wallets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-gradient-to-b from-neutral-100 to-white text-foreground">
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
