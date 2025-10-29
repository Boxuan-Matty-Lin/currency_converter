import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach , type Mock  } from "vitest";
import { CurrencySidebar } from "../CurrencySidebar";

const mockRatesResponse = {
  base: "AUD",
  timestamp: 1234567890,
  rates: {
    USD: 0.65,
    EUR: 0.6,
    JPY: 95,
    GBP: 0.5,
    CNY: 4.2,
  },
};

describe("CurrencySidebar", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRatesResponse),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it("renders skeletons during loading and updates cards after user inputs amount", async () => {
    render(<CurrencySidebar />);
    // Loading state shows skeleton items (status role from Skeleton)
    expect(screen.getAllByRole("status")).toHaveLength(5);

    // Wait for cards to appear after fetch completes
    await waitFor(() => {
      expect(screen.getByText("USD")).toBeInTheDocument();
      expect(screen.getByText("EUR")).toBeInTheDocument();
    });

    // Simulate user entering an amount
    const input = screen.getByPlaceholderText(/enter amount/i);
    fireEvent.change(input, { target: { value: "100" } });

    const expectedUsdAmount = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(100 * mockRatesResponse.rates.USD);

    await waitFor(() => {
      expect(screen.getByText(expectedUsdAmount)).toBeInTheDocument();
    });
  });

  it("shows error message when fetch fails", async () => {
(global.fetch as unknown as Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<CurrencySidebar />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load rates/i)).toBeInTheDocument();
    });
  });

  it("triggers refresh when clicking refresh button", async () => {
    render(<CurrencySidebar />);

    await waitFor(() => {
      expect(screen.getByText("USD")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /refresh rates/i }));
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
