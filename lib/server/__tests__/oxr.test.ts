// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// mock server-only
vi.mock("server-only", () => ({}));

describe("oxr", () => {
  beforeEach(() => {
    process.env.OXR_BASE_URL = "https://api.test";
    process.env.OXR_APP_ID = "test-key";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        timestamp: 1,
        base: "USD",
        rates: { AUD: 1.0 }
      }),
    }) as any;
  });

  it("calls correct URL and returns data", async () => {
    const { getLatest } = await import("../oxr"); // dynamic import after setting env
    const result = await getLatest();

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.test/latest.json?app_id=test-key",
      expect.objectContaining({ cache: "no-store" })
    );

    expect(result).toEqual({
      timestamp: 1,
      base: "USD",
      rates: { AUD: 1.0 },
    });
  });
});
