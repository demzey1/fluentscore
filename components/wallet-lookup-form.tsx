"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { isAddress } from "viem";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WalletLookupFormProps {
  placeholder?: string;
  ctaLabel?: string;
}

export function WalletLookupForm({
  placeholder = "0x...",
  ctaLabel = "View Score",
}: WalletLookupFormProps) {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = address.trim();
    if (!isAddress(trimmed)) {
      setError("Enter a valid EVM wallet address.");
      return;
    }
    setError(null);
    router.push(`/score/${trimmed}`);
  };

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-2xl flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row">
        <Input
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder={placeholder}
          className="h-11"
          aria-label="Fluent wallet address"
        />
        <Button type="submit" className="h-11 min-w-36">
          {ctaLabel}
        </Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
