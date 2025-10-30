import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { ComponentProps } from "react";
import { CurrencySidebar, type Rates, TARGET_CODES } from "../CurrencySidebar";

const rates: Rates = {
  USD: 0.65,
  EUR: 0.6,
  JPY: 95,
  GBP: 0.5,
  CNY: 4.2,
};

describe("CurrencySidebar", () => {
  const renderSidebar = (override?: Partial<ComponentProps<typeof CurrencySidebar>>) => {
    const props: ComponentProps<typeof CurrencySidebar> = {
      amount: "",
      rates,
      loading: false,
      error: "",
      onAmountChange: vi.fn(),
      onRefresh: vi.fn(),
      selectedCode: TARGET_CODES[0],
      onSelectCurrency: vi.fn(),
      ...override,
    };
    return {
      props,
      ...render(<CurrencySidebar {...props} />),
    };
  };

  it("renders skeletons while loading", () => {
    renderSidebar({ loading: true, rates: null });
    expect(screen.getAllByRole("status")).toHaveLength(5);
  });

  it("displays converted amounts when rates and amount are provided", () => {
    renderSidebar({ amount: "100" });

    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("EUR")).toBeInTheDocument();

    const expectedUsdAmount = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(100 * rates.USD);

    expect(screen.getByText(expectedUsdAmount)).toBeInTheDocument();
  });

  it("invokes callbacks for amount changes and refresh", () => {
    const onAmountChange = vi.fn();
    const onRefresh = vi.fn();
    const { props } = renderSidebar({ onAmountChange, onRefresh });

    const input = screen.getByPlaceholderText(/enter amount/i);
    fireEvent.change(input, { target: { value: "50" } });
    expect(onAmountChange).toHaveBeenCalledWith("50");

    fireEvent.click(screen.getByRole("button", { name: /refresh rates/i }));
    expect(onRefresh).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /USD/ }));
    expect(props.onSelectCurrency).toHaveBeenCalledWith("USD");
  });

  it("does not highlight when selectedCode is null", () => {
    renderSidebar({ selectedCode: null });
    const card = screen.getByRole("button", { name: /USD/ });
    expect(card).toHaveAttribute("aria-pressed", "false");
  });

  it("shows error message when provided", () => {
    renderSidebar({ error: "Failed to load rates. Please try again." });
    expect(screen.getByText(/failed to load rates/i)).toBeInTheDocument();
  });
});
