"use client";

import { useState, useEffect } from "react";
import type { WalletScoreResult } from "@/lib/scoring/types";
import { Badge } from "@/components/ui/badge";

interface ScoreBreakdownProps {
  score: WalletScoreResult;
}

function AnimatedNumber({
  value,
  duration = 1000,
}: {
  value: number;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (value - startValue) * easeOut);
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

function ScoreRing({
  score,
  size = 180,
  strokeWidth = 12,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  useEffect(() => {
    setMounted(true);
  }, []);

  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-success";
    if (s >= 60) return "text-primary";
    if (s >= 40) return "text-warning";
    return "text-destructive";
  };

  const getScoreGradient = (s: number) => {
    if (s >= 80) return "url(#gradient-success)";
    if (s >= 60) return "url(#gradient-primary)";
    if (s >= 40) return "url(#gradient-warning)";
    return "url(#gradient-destructive)";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="rotate-[-90deg]"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id="gradient-success" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.7 0.18 145)" />
            <stop offset="100%" stopColor="oklch(0.75 0.15 180)" />
          </linearGradient>
          <linearGradient id="gradient-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.75 0.15 180)" />
            <stop offset="100%" stopColor="oklch(0.65 0.12 250)" />
          </linearGradient>
          <linearGradient id="gradient-warning" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.75 0.15 80)" />
            <stop offset="100%" stopColor="oklch(0.7 0.18 60)" />
          </linearGradient>
          <linearGradient id="gradient-destructive" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.65 0.2 25)" />
            <stop offset="100%" stopColor="oklch(0.6 0.22 15)" />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="oklch(0.2 0 0)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getScoreGradient(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? offset : circumference}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-bold ${getScoreColor(score)}`}>
          <AnimatedNumber value={score} />
        </span>
        <span className="text-sm text-muted-foreground">out of 100</span>
      </div>
    </div>
  );
}

function ScoreCard({
  title,
  value,
  maxValue,
  description,
  delay = 0,
}: {
  title: string;
  value: number;
  maxValue: number;
  description: string;
  delay?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const percentage = (value / maxValue) * 100;

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`rounded-xl border border-border/50 bg-card/30 p-5 backdrop-blur-sm transition-all duration-500 ${
        mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-medium">{title}</h4>
        <span className="font-mono text-lg font-bold text-primary">
          <AnimatedNumber value={value} duration={800} />
        </span>
      </div>
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
          style={{ width: mounted ? `${percentage}%` : "0%" }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function MetricRow({
  label,
  value,
  delay = 0,
}: {
  label: string;
  value: string | number;
  delay?: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`flex items-center justify-between border-b border-border/30 py-3 last:border-0 transition-all duration-300 ${
        mounted ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
      }`}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  );
}

function getWalletLabels(score: WalletScoreResult): string[] {
  const labels: string[] = [];
  
  // OG label - first transaction older than 30 days
  if (score.metrics.activeDays > 30) {
    labels.push("Fluent OG");
  }
  
  // Builder label - has deployed contracts
  if (score.breakdown.balance > 15) {
    labels.push("Builder");
  }
  
  // Explorer label - high diversity
  if (score.breakdown.diversity > 20) {
    labels.push("Explorer");
  }
  
  // Activity-based labels
  if (score.metrics.transactionCount < 5) {
    labels.push("Newcomer");
  }
  
  if (score.metrics.transactionCount === 0 && score.breakdown.activity === 0) {
    labels.push("Inactive");
  }
  
  return labels;
}

function getScoreExplanation(score: WalletScoreResult): string {
  const { totalScore, breakdown, metrics } = score;
  
  if (totalScore >= 80) {
    return "This wallet demonstrates exceptional engagement with the Fluent ecosystem. High activity levels, diverse contract interactions, and consistent participation indicate a power user or active developer.";
  }
  
  if (totalScore >= 60) {
    return "This wallet shows solid engagement with Fluent Testnet. Regular transactions and reasonable diversity suggest an active ecosystem participant who has explored multiple protocols.";
  }
  
  if (totalScore >= 40) {
    return "This wallet has moderate activity on Fluent Testnet. There's room to increase engagement through more diverse contract interactions and consistent usage patterns.";
  }
  
  if (totalScore >= 20) {
    return "This wallet has limited activity on Fluent Testnet. Early-stage participation detected - continued engagement will improve the score over time.";
  }
  
  return "This wallet has minimal or no activity on Fluent Testnet. Start interacting with Fluent dApps and contracts to build your score.";
}

export function ScoreBreakdown({ score }: ScoreBreakdownProps) {
  const labels = getWalletLabels(score);
  const explanation = getScoreExplanation(score);
  const calculatedDate = new Date(score.calculatedAt);

  return (
    <div className="space-y-6">
      {/* Main score display */}
      <div className="rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm sm:p-8">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
          {/* Score ring */}
          <div className="flex flex-col items-center gap-4">
            <ScoreRing score={score.totalScore} />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Fluent Wallet Score</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground/70">
                Chain ID: {score.chainId}
              </p>
            </div>
          </div>

          {/* Score cards */}
          <div className="flex-1 w-full">
            <div className="grid gap-4 sm:grid-cols-2">
              <ScoreCard
                title="Activity Score"
                value={score.breakdown.activity}
                maxValue={30}
                description="Based on transaction volume and frequency"
                delay={100}
              />
              <ScoreCard
                title="Diversity Score"
                value={score.breakdown.diversity}
                maxValue={25}
                description="Variety of contracts and interactions"
                delay={200}
              />
              <ScoreCard
                title="Consistency Score"
                value={score.breakdown.consistency}
                maxValue={25}
                description="Regular activity over time"
                delay={300}
              />
              <ScoreCard
                title="Balance Score"
                value={score.breakdown.balance}
                maxValue={20}
                description="Native token holdings contribution"
                delay={400}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Labels */}
      {labels.length > 0 && (
        <div className="animate-fade-in rounded-xl border border-border/50 bg-card/30 p-5 backdrop-blur-sm">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Wallet Labels
          </h3>
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <Badge
                key={label}
                variant="outline"
                className={`px-3 py-1 ${
                  label === "Fluent OG"
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : label === "Builder"
                    ? "border-success/50 bg-success/10 text-success"
                    : label === "Explorer"
                    ? "border-chart-3/50 bg-chart-3/10 text-chart-3"
                    : label === "Inactive"
                    ? "border-destructive/50 bg-destructive/10 text-destructive"
                    : "border-muted-foreground/50 bg-muted text-muted-foreground"
                }`}
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="animate-fade-in rounded-xl border border-border/50 bg-card/30 p-5 backdrop-blur-sm stagger-2">
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Wallet Metrics
        </h3>
        <div>
          <MetricRow
            label="Total Transactions"
            value={score.metrics.transactionCount.toLocaleString()}
            delay={500}
          />
          <MetricRow
            label="Unique Contracts"
            value={score.metrics.uniqueContracts.toLocaleString()}
            delay={600}
          />
          <MetricRow
            label="Active Days"
            value={score.metrics.activeDays}
            delay={700}
          />
          <MetricRow
            label="Native Balance"
            value={`${Number(score.metrics.nativeBalanceEth).toFixed(6)} ETH`}
            delay={800}
          />
        </div>
      </div>

      {/* Explanation */}
      <div className="animate-fade-in rounded-xl border border-border/50 bg-card/30 p-5 backdrop-blur-sm stagger-3">
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Score Explanation
        </h3>
        <p className="text-muted-foreground">{explanation}</p>
      </div>

      {/* Data freshness */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border/30 bg-muted/20 px-4 py-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Last indexed: {calculatedDate.toLocaleDateString()}{" "}
            {calculatedDate.toLocaleTimeString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="text-xs text-muted-foreground">Data from Fluent Testnet</span>
        </div>
      </div>
    </div>
  );
}
