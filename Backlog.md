## Backlog · Post-MVP

### 1) Center the chart on desktop
- **Type:** UI/UX · **Priority:** P3
- **Requirement:** On desktop widths, center the chart container to improve visual focus and hierarchy. Keep mobile layout unchanged.
- **DoD:**
  - On desktop, the chart is centered within the viewport and not obstructed by other UI elements
  - Mobile layout remains unchanged
  - No noticeable drop in visual stability metrics, for example CLS remains stable

### 2) Optimize 14-day history requests, latest plus 13-day cache
- **Type:** Performance/Reliability · **Priority:** P1
- **Requirement:** Split the 14-day retrieval into one latest request and one 13-day history request. Cache the 13-day history on a daily basis. While the cache is valid, fetch only latest and combine with the cached history to reduce request count and quota usage.
- **DoD:**
  - Cold start triggers two requests and returns a full 14-day series
  - With a valid cache, subsequent calls trigger only one latest request and still return a full 14-day series
  - On failure, falls back to the last available data and clearly shows the data timestamp, “as of”
  - Basic tests cover cache hit and cache miss paths

### 3) Add Playwright end-to-end tests for critical user flows
- **Type:** Testing/Quality · **Priority:** P2
- **Requirement:** Introduce Playwright E2E coverage for the core flows: entering an amount and seeing updated conversions, handling loading and error states, opening and closing the 14-day chart view, and basic responsive checks for desktop and mobile.
- **DoD:**
  - E2E suite runs with a single command locally and in CI, exits green
  - Tests are deterministic and independent, with sensible timeouts
  - On CI failure, artifacts are available, for example screenshots, video, and trace
  - Minimum one end-to-end check per core flow listed above


### 4) Windows 10 flag rendering fallback
- **Type:** Compatibility/UI · **Priority:** P2
- **Requirement:** Provide a reliable fallback for currency flags on Windows 10 where flag emojis may not render. Replace missing flags with a consistent alternative, for example ISO code badges or icon assets, and keep accessible labels intact.
- **DoD:**
  - On a Windows 10 environment, no missing glyphs or tofu squares appear
  - A clear fallback is shown for all currencies and remains consistent across browsers
  - Accessible name includes the currency name for screen readers
  - Visual regression checks confirm layout stability when fallbacks are used