import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CurrencyAmountInput } from "../CurrencyAmountInput";

describe("CurrencyAmountInput", () => {
  it("calls onAmountChange immediately for valid numeric input and shows no warning", () => {
    const handleChange = vi.fn();
    const handleRefresh = vi.fn();

    render(
      <CurrencyAmountInput
        amount="100"
        loading={false}
        onAmountChange={handleChange}
        onRefresh={handleRefresh}
      />
    );

    // Simulate user typing a valid decimal number
    const input = screen.getByPlaceholderText(/enter amount/i);
    fireEvent.change(input, { target: { value: "123.45" } });

    expect(handleChange).toHaveBeenCalledWith("123.45");
    expect(screen.queryByText(/use numbers only/i)).toBeNull();
  });

  it("blocks invalid characters, keeps original value, and displays gentle hint", () => {
    const handleChange = vi.fn();
    const handleRefresh = vi.fn();

    render(
      <CurrencyAmountInput
        amount="100"
        loading={false}
        onAmountChange={handleChange}
        onRefresh={handleRefresh}
      />
    );

    const input = screen.getByPlaceholderText(/enter amount/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "abc" } });

    expect(handleChange).not.toHaveBeenCalled();
    // The controlled value should remain unchanged because parent wasn't notified
    expect(input.value).toBe("100");
    expect(screen.getByText(/use numbers only/i)).toBeInTheDocument();
  });

  it("invokes onRefresh when enabled and respects loading disabled state", () => {
    const handleChange = vi.fn();
    const handleRefresh = vi.fn();

    const { rerender } = render(
      <CurrencyAmountInput
        amount="100"
        loading={false}
        onAmountChange={handleChange}
        onRefresh={handleRefresh}
      />
    );

    const refreshButton = screen.getByRole("button", { name: /refresh rates/i });
    fireEvent.click(refreshButton);
    expect(handleRefresh).toHaveBeenCalled();
    handleRefresh.mockClear();

    // When loading, the button should be disabled and ignore clicks
    rerender(
      <CurrencyAmountInput
        amount="100"
        loading
        onAmountChange={handleChange}
        onRefresh={handleRefresh}
      />
    );
    const disabledButton = screen.getByRole("button", { name: /refresh rates/i });
    expect(disabledButton).toBeDisabled();
    fireEvent.click(disabledButton);
    expect(handleRefresh).not.toHaveBeenCalled();
  });
});
