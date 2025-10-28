// components/sidebar/CurrencyAmountInput.tsx
"use client";

import { useEffect, useState } from "react";
import { Button, Input } from "@/components/ui";
import { RefreshCw, Info } from "lucide-react";

type Props = {
  /** Current amount as string (partial numeric input allowed) */
  amount: string;
  /** Loading state for refresh action; disables the button */
  loading: boolean;
  /** Callback fired when the input changes with a valid numeric value */
  onAmountChange: (value: string) => void;
  /** Trigger executed when the refresh button is pressed */
  onRefresh: () => void;
};

const DECIMAL_REGEX = /^\d*(\.\d*)?$/; // Matches valid decimal numbers

/**
 * Numeric amount input with AUD label and refresh action.
 * - Accepts string value (allows partial input) and validates digits/decimal.
 * - Shows a gentle inline hint when input contains non-numeric characters.
 * - Emits `onAmountChange` on every valid keystroke; `onRefresh` triggers a reload.
 */
export function CurrencyAmountInput({
  amount,
  loading,
  onAmountChange,
  onRefresh,
}: Props) {
  const [inputError, setInputError] = useState(""); // Validation error message

  useEffect(() => {
    setInputError("");
  }, [amount]);  

  const handleChange = (value: string) => {
    if (value === "" || DECIMAL_REGEX.test(value)) {
      setInputError("");
      onAmountChange(value);
    } else {
      setInputError("Use numbers only");
    }
  };  

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm font-medium uppercase">
        <span className="text-2xl leading-none">🇦🇺</span>
        <span>AUD</span>
      </div>

      <div className="flex-1 pl-1">
        <Input
          id="aud-amount"
          value={amount}
          onChange={(e) => handleChange(e.target.value)}
          inputMode="decimal"
          placeholder="Enter amount"
          aria-invalid={inputError ? "true" : "false"}
          className="w-full border-0 bg-transparent text-left text-lg font-semibold shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {inputError && (
          <div className="mt-2 flex items-center gap-1 rounded-md bg-muted/80 px-2 py-1 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" aria-hidden />
            <span>{inputError}</span>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        className="shrink-0"
        disabled={loading}
      >
        <RefreshCw
          className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`}
          aria-hidden
        />
        <span className="sr-only">Refresh rates</span>
      </Button>
    </div>
  );
}
