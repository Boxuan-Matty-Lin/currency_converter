"use client";

import { useEffect, useState } from "react";

/**
 * Reports whether the viewport matches the provided desktop breakpoint.
 *
 * @param breakpoint - CSS media query string to evaluate. Defaults to `(min-width: 1024px)`.
 */
export function useResponsiveDesktop(breakpoint = "(min-width: 1024px)") {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(breakpoint).matches : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(breakpoint);
    const update = (matches: boolean) => setIsDesktop(matches);

    update(mq.matches);

    const listener = (event: MediaQueryListEvent) => update(event.matches);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }

    mq.addListener(listener);
    return () => mq.removeListener(listener);
  }, [breakpoint]);

  return isDesktop;
}
