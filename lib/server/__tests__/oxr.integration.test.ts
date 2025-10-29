// tests/integration/oxr.integration.test.ts
// @vitest-environment node
import { describe, it, expect , vi } from "vitest";

// 1) Avoid Next runtime constraints in Node
vi.mock("server-only", () => ({}));

// Only run when explicitly enabled
const run = !!process.env.CI_API_TEST;
const envOK = !!process.env.OXR_BASE_URL && !!process.env.OXR_APP_ID;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Simple retry to mitigate transient 5xx/rate-limit
async function withRetry<T>(fn: () => Promise<T>, tries = 2) {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < tries - 1) await sleep(500);
    }
  }
  throw lastErr;
}

(run && envOK ? describe : describe.skip)("integration: oxr.getLatest()", () => {
  it(
    "hits real upstream and returns a USD-based table including AUD",
    async () => {
      // Import after env is available
      const { getLatest } = await import("../oxr");

      const data = await withRetry(() => getLatest(), 2);

      // Basic shape checks (keep assertions resilient)
      expect(data).toBeTruthy();
      expect(data.base).toBe("USD");
      expect(typeof data.timestamp).toBe("number");
      expect(data.timestamp).toBeGreaterThan(0);

      expect(data.rates).toBeTypeOf("object");
      expect(data.rates).toHaveProperty("AUD");

      const aud = data.rates["AUD"];
      expect(typeof aud).toBe("number");
      // Reasonable bound to avoid flaky tight assertions
      expect(aud).toBeGreaterThan(0);
      expect(aud).toBeLessThan(1000);
    },
    30_000 // generous timeout for network
  );
});

// Helpful message when skipped
if (run && !envOK) {
  // eslint-disable-next-line no-console
  console.warn(
    "[integration:oxr] Skipped because OXR_BASE_URL or OXR_APP_ID is missing."
  );
}
