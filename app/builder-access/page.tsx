"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { Button } from "@/components/ui/button";

function PasscodeInput({
  value,
  onChange,
  length = 6,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    if (!/^[a-zA-Z0-9]*$/.test(char)) return;

    const newValue = value.split("");
    newValue[index] = char.slice(-1);
    const joined = newValue.join("").slice(0, length);
    onChange(joined);

    // Move to next input
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    onChange(pastedData);
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="password"
          inputMode="text"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="h-12 w-10 rounded-lg border border-border/50 bg-card/50 text-center font-mono text-lg transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 sm:h-14 sm:w-12 sm:text-xl"
          autoComplete="off"
        />
      ))}
    </div>
  );
}

function BuilderAccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const errorParam = searchParams.get("error");

  useEffect(() => {
    if (errorParam) {
      setError("Invalid passcode. Please try again.");
    }
  }, [errorParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.length < 4) {
      setError("Please enter the complete passcode");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("passcode", passcode);

      const response = await fetch("/builder-access", {
        method: "POST",
        body: formData,
      });

      if (response.redirected) {
        setIsUnlocked(true);
        setTimeout(() => {
          router.push("/builder");
        }, 1000);
      } else {
        setError("Invalid passcode. Please try again.");
        setPasscode("");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Unlock animation state
  if (isUnlocked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 animate-pulse-glow items-center justify-center rounded-full bg-success/10">
              <svg
                className="h-10 w-10 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-success">Access Granted</h2>
          <p className="text-muted-foreground">Entering Builder Mode...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm sm:p-8">
          {/* Lock icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <svg
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
          </div>

          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl font-bold">Builder Mode Access</h1>
            <p className="text-sm text-muted-foreground">
              Enter the developer passcode to access rule set management and
              eligibility evaluation tools.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <PasscodeInput
                value={passcode}
                onChange={(val) => {
                  setPasscode(val);
                  if (error) setError(null);
                }}
                length={6}
                disabled={isLoading}
              />
              {error && (
                <p className="text-center text-sm text-destructive">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || passcode.length < 4}
              className="h-12 w-full"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Verifying...
                </span>
              ) : (
                <>
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                  Unlock Builder Mode
                </>
              )}
            </Button>
          </form>

          {/* Notice */}
          <div className="mt-6 rounded-lg border border-border/30 bg-muted/20 p-3">
            <p className="text-center text-xs text-muted-foreground">
              Builder Mode is for developers creating eligibility rule sets.
              This is not a consumer-facing feature.
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to FluentScore
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BuilderAccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      }
    >
      <BuilderAccessContent />
    </Suspense>
  );
}
