"use client";

import { useState } from "react";

const steps = [
  {
    number: "01",
    title: "Enter Wallet Address",
    description:
      "Paste any EVM wallet address or connect your wallet to begin the analysis process.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
        />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Index Fluent Activity",
    description:
      "We query Fluent Testnet RPC and FluentScan to gather all wallet transactions and interactions.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
        />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Compute Score",
    description:
      "Our algorithm analyzes activity patterns, diversity, builder signals, and consistency metrics.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
        />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Persist Snapshot",
    description:
      "Score breakdowns are cached and timestamped for eligibility workflows and historical reference.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
        />
      </svg>
    ),
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="relative">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          How it works
        </h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          FluentScore indexes on-chain activity from Fluent Testnet to generate
          comprehensive wallet scores in seconds.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {steps.map((step, index) => (
          <button
            key={step.number}
            onClick={() => setActiveStep(index)}
            className={`card-hover group relative rounded-xl border p-6 text-left transition-all ${
              activeStep === index
                ? "border-primary/50 bg-primary/5"
                : "border-border/50 bg-card/30 hover:border-border"
            }`}
          >
            {/* Connection line */}
            {index < steps.length - 1 && (
              <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-border/50 lg:block" />
            )}

            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
                activeStep === index
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-muted/80"
              }`}
            >
              {step.icon}
            </div>

            <div className="mb-2 font-mono text-xs text-muted-foreground">
              {step.number}
            </div>

            <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>

            <p
              className={`text-sm transition-colors ${
                activeStep === index
                  ? "text-foreground/80"
                  : "text-muted-foreground"
              }`}
            >
              {step.description}
            </p>

            {/* Active indicator */}
            {activeStep === index && (
              <div className="absolute -bottom-px left-6 right-6 h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
