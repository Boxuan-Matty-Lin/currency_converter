import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CurrencyCard } from "../CurrencyCard";

describe("CurrencyCard", () => {
  it("renders currency metadata and formatted values", () => {
    render(
      <CurrencyCard
        code="USD"
        flag="🇺🇸"
        label="United States Dollar"
        amount={65.55}
        rate={0.6555}
      />
    );

    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("United States Dollar")).toBeInTheDocument();
    expect(
      screen.getByText(new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(65.55))
    ).toBeInTheDocument();
    expect(screen.getByText("1 AUD = 0.6555 USD")).toBeInTheDocument();
  });

  it("shows placeholders when amount or rate is missing", () => {
    render(
      <CurrencyCard code="EUR" flag="🇪🇺" label="Euro" amount={null} rate={null} />
    );

    const placeholders = screen.getAllByText("—");
    expect(placeholders.length).toBeGreaterThan(0);
    expect(screen.getByText("1 AUD = — EUR")).toBeInTheDocument();
  });

  it("keeps amount horizontally scrollable for large numbers", () => {
    const { container } = render(
      <CurrencyCard
        code="JPY"
        flag="🇯🇵"
        label="Japanese Yen"
        amount={9999999999999999999999}
        rate={100}
      />
    );

    const scrollContainer = container.querySelector(".max-w-\\[220px\\]");
    expect(scrollContainer).toHaveClass("overflow-x-auto");
  });
});
