"use client";

import { useState } from "react";

const metrics = [
  {
    id: "activity",
    name: "Activity Score",
    description:
      "Measures total transaction volume, frequency, and recency of wallet activity on Fluent Testnet.",
    weight: 25,
    signals: [
      "Total transaction count",
      "Recent activity (last 30 days)",
      "Transaction frequency patterns",
    ],
  },
  {
    id: "diversity",
    name: "Diversity Score",
    description:
      "Evaluates the variety of contracts interacted with and types of on-chain actions performed.",
    weight: 25,
    signals: [
      "Unique contracts interacted",
      "Contract categories covered",
      "Token variety",
    ],
  },
  {
    id: "builder",
    name: "Builder Score",
    description:
      "Identifies developer activity like contract deployments, verified contracts, and dev tool usage.",
    weight: 30,
    signals: [
      "Contracts deployed",
      "Verified contracts",
      "Developer tooling interactions",
    ],
  },
  {
    id: "og",
    name: "Fluent OG Score",
    description:
      "Rewards early adopters based on first transaction date and sustained participation over time.",
    weight: 20,
    signals: [
      "First Fluent transaction date",
      "Continuous activity streaks",
      "Historical engagement",
    ],
  },
];

export function WhatWeMeasureSection() {
  const [activeMetric, setActiveMetric] = useState(metrics[0]);

  return (
    <section className="relative">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          What FluentScore measures
        </h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          A comprehensive scoring system that evaluates wallets across four key
          dimensions of Fluent ecosystem participation.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Metric selector */}
        <div className="flex flex-col gap-2 lg:col-span-2">
          {metrics.map((metric) => (
            <button
              key={metric.id}
              onClick={() => setActiveMetric(metric)}
              className={`group flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                activeMetric.id === metric.id
                  ? "border-primary/50 bg-primary/5"
                  : "border-border/50 bg-card/30 hover:border-border hover:bg-card/50"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold transition-colors ${
                  activeMetric.id === metric.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {metric.weight}%
              </div>
              <div className="min-w-0">
                <div className="font-semibold">{metric.name}</div>
                <div className="truncate text-sm text-muted-foreground">
                  Weight: {metric.weight} points
                </div>
              </div>
              <svg
                className={`ml-auto h-5 w-5 shrink-0 transition-transform ${
                  activeMetric.id === metric.id
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ))}
        </div>

        {/* Active metric detail */}
        <div className="lg:col-span-3">
          <div className="h-full rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold">{activeMetric.name}</h3>
                <p className="mt-2 text-muted-foreground">
                  {activeMetric.description}
                </p>
              </div>
              <div className="rounded-full bg-primary/10 px-4 py-2 font-mono text-lg font-bold text-primary">
                {activeMetric.weight}%
              </div>
            </div>

            {/* Progress visualization */}
            <div className="mb-6">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Score weight</span>
                <span className="font-mono text-foreground">
                  {activeMetric.weight}/100
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${activeMetric.weight}%` }}
                />
              </div>
            </div>

            {/* Signals */}
            <div>
              <h4 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Key Signals
              </h4>
              <ul className="space-y-3">
                {activeMetric.signals.map((signal, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 rounded-lg border border-border/30 bg-muted/30 px-4 py-3"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <svg
                        className="h-3 w-3 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
