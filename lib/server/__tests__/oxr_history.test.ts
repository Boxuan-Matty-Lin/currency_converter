// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({})); // strip Next.js server-only guard in tests

const rebaseToAUDMock = vi.fn();
const getHistoricalMock = vi.fn();
const buildPastDatesUTCMock = vi.fn();

vi.mock("../oxr_convert", () => ({
  rebaseToAUD: (...args: unknown[]) => rebaseToAUDMock(...args),
  DEFAULTS_CURRENCY: ["USD", "EUR", "JPY", "GBP", "CNY"] as const,
}));

vi.mock("../oxr", () => ({
  getHistorical: (...args: unknown[]) => getHistoricalMock(...args),
}));

vi.mock("../../time_utils", () => ({
  buildPastDatesUTC: (...args: unknown[]) => buildPastDatesUTCMock(...args),
}));

vi.mock("../../time_utils.ts", () => ({
  buildPastDatesUTC: (...args: unknown[]) => buildPastDatesUTCMock(...args),
}));

import type { HistoryByDate } from "../oxr_history";

const loadModule = async () => {
  // ensure the module is loaded after mocks are registered
  return import("../oxr_history");
};

describe("oxr_history", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  describe("toAudRow", () => {
    it("rebases rates and keeps only requested targets", async () => {
      const { toAudRow } = await loadModule();
      const usdRates = { USD: 0.7, EUR: 0.65, AUD: 1, GBP: 0.5 };
      rebaseToAUDMock.mockReturnValue({
        USD: 0.75,
        EUR: 0.66,
        GBP: 0.52,
        AUD: 1,
      });

      const row = toAudRow(usdRates, ["USD", "GBP", "NZD"], "2024-01-01");

      expect(rebaseToAUDMock).toHaveBeenCalledWith(usdRates);
      expect(row).toEqual({
        date: "2024-01-01",
        USD: 0.75,
        GBP: 0.52,
      });
      expect(row).not.toHaveProperty("NZD");
    });
  });

  describe("getHistoryByDateAUD", () => {
    it("collects historical rows in date order", async () => {
      const { getHistoryByDateAUD } = await loadModule();
      buildPastDatesUTCMock.mockReturnValue(["2024-01-01", "2024-01-02"]);
      rebaseToAUDMock.mockImplementation((rates: Record<string, number>) => ({ ...rates }));
      getHistoricalMock
        .mockResolvedValueOnce({
          rates: { AUD: 1, USD: 0.7, EUR: 0.65 },
          base: "USD",
          timestamp: 1,
        })
        .mockResolvedValueOnce({
          rates: { AUD: 1, USD: 0.71, EUR: 0.66 },
          base: "USD",
          timestamp: 2,
        });

      // verifies date ordering and case-insensitive target handling
      const result = await getHistoryByDateAUD(2, ["usd", "EUR"]);

      expect(buildPastDatesUTCMock).toHaveBeenCalledWith(2);
      expect(getHistoricalMock).toHaveBeenCalledTimes(2);
      expect(getHistoricalMock).toHaveBeenNthCalledWith(1, "2024-01-01");
      expect(getHistoricalMock).toHaveBeenNthCalledWith(2, "2024-01-02");

      expect(result.base).toBe("AUD");
      expect(result.startDate).toBe("2024-01-01");
      expect(result.endDate).toBe("2024-01-02");
      expect(result.points).toEqual([
        { date: "2024-01-01", USD: 0.7, EUR: 0.65 },
        { date: "2024-01-02", USD: 0.71, EUR: 0.66 },
      ]);
    });

    it("marks failed dates with error after exhausting retries", async () => {
      const { getHistoryByDateAUD } = await loadModule();
      buildPastDatesUTCMock.mockReturnValue(["2024-01-05"]);
      getHistoricalMock.mockRejectedValue(new Error("boom"));

      vi.useFakeTimers();
      let result: Awaited<ReturnType<typeof getHistoryByDateAUD>>;
      try {
        const promise = getHistoryByDateAUD(1, ["USD"]);
        await vi.runAllTimersAsync(); // fast-forward retry backoff
        result = await promise;
      } finally {
        vi.useRealTimers();
      }

      expect(getHistoricalMock).toHaveBeenCalledTimes(3);
      expect(result.points).toEqual([{ date: "2024-01-05", error: "fetch_failed" }]);
    });
  });

  describe("toByCurrency", () => {
    it("builds per-currency series and skips non-numeric values", async () => {
      const { toByCurrency } = await loadModule();
      const points: HistoryByDate["points"] = [
        { date: "2024-01-01", USD: 0.7, EUR: 0.65 },
        { date: "2024-01-02", USD: 0.71, EUR: 0.66 },
        { date: "2024-01-03", error: "fetch_failed" },
      ];

      const series = toByCurrency(points, ["USD", "EUR"]);

      expect(series.USD).toEqual([
        { date: "2024-01-01", value: 0.7 },
        { date: "2024-01-02", value: 0.71 },
      ]);
      expect(series.EUR).toEqual([
        { date: "2024-01-01", value: 0.65 },
        { date: "2024-01-02", value: 0.66 },
      ]);
    });
  });
});
