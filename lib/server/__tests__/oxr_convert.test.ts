// src/lib/server/__tests__/oxr_convert.test.ts
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// 1) Avoid Next runtime constraints in Node
vi.mock("server-only", () => ({}));

// 2) Mock downstream data source used by the module under test
const getLatestMock = vi.fn();
vi.mock("../oxr", () => ({
  getLatest: (...args: any[]) => getLatestMock(...args),
}));

// 3) Import the module under test
import { rebaseToAUD, latestAudRates, DEFAULTS_CURRENCY } from "../oxr_convert";

describe("rebaseToAUD", () => {
  it("re-bases USD/EUR etc by AUD and keeps AUD as 1", () => {
    const src = { USD: 0.65, EUR: 0.60, AUD: 1 };
    const out = rebaseToAUD(src);

    // 1 AUD -> USD = rates.USD / rates.AUD
    expect(out.USD).toBeCloseTo(0.65 / 1, 10);
    expect(out.EUR).toBeCloseTo(0.60 / 1, 10);
    expect(out.AUD).toBe(1);
  });

  it("does not mutate the input object", () => {
    const src = { USD: 0.7, AUD: 2 };
    const snapshot = { ...src };
    const out = rebaseToAUD(src);

    expect(src).toEqual(snapshot);
    expect(out).not.toBe(src);
  });

  it("when AUD is missing, divisions result in NaN and AUD is set to 1 (documenting current behavior)", () => {
    const src = { USD: 0.65, EUR: 0.60 }; // no AUD
    const out = rebaseToAUD(src);

    expect(Number.isNaN(out.USD)).toBe(true);
    expect(Number.isNaN(out.EUR)).toBe(true);
    expect(out.AUD).toBe(1);
  });

  it("when AUD is 0, divisions result in Infinity and AUD remains 1 (documenting current behavior)", () => {
    const src = { USD: 0.65, AUD: 0 };
    const out = rebaseToAUD(src);

    expect(out.USD).toBe(Infinity);
    expect(out.AUD).toBe(1);
  });
});

describe("latestAudRates", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getLatestMock.mockReset().mockResolvedValue({
      timestamp: 1234567890,
      base: "USD",
      rates: {
        USD: 0.65,
        EUR: 0.60,
        JPY: 100,
        GBP: 0.5,
        CNY: 0.45,
        AUD: 1,
      },
    });
  });

  it("returns default currencies when targets are not provided", async () => {
    const res = await latestAudRates();

    expect(res.base).toBe("AUD");
    expect(res.timestamp).toBe(1234567890);

    // Only currencies that exist in source data should appear
    for (const c of DEFAULTS_CURRENCY) {
      expect(Object.keys(res.rates)).toContain(c);
    }
  });

  it("uses provided targets (case-insensitive, deduplicated, trimmed)", async () => {
    const res = await latestAudRates(["usd", "USD", " jpy ", "", "GBP"]);
    expect(Object.keys(res.rates).sort()).toEqual(["GBP", "JPY", "USD"].sort());
  });

  it("ignores targets that are not present in source rates", async () => {
    const res = await latestAudRates(["USD", "ABC", "EUR"]);
    expect(Object.keys(res.rates).sort()).toEqual(["EUR", "USD"].sort());
  });

  it("bubbles up errors from getLatest", async () => {
    getLatestMock.mockRejectedValueOnce(new Error("boom"));

    await expect(latestAudRates()).rejects.toThrow(/boom/);
  });

  it("propagates timestamp from getLatest and keeps base as AUD", async () => {
    const res = await latestAudRates(["USD"]);
    expect(res.base).toBe("AUD");
    expect(res.timestamp).toBe(1234567890);
  });
});
