'use client';

import { useCallback, useEffect, useState } from "react";

/**
 * Manages the chart modal state.
 * - Auto-closes when the layout switches to desktop
 * - Locks body scroll while the modal is open
 * - Closes on Escape key
 *
 * @param isDesktop True when the desktop breakpoint is active
 */
export function useChartModal(isDesktop: boolean) {
  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  // Auto-close when switching to desktop layout
  useEffect(() => {
    if (isDesktop) setOpen(false);
  }, [isDesktop]);

  // Lock body scroll while the modal is open
  useEffect(() => {
    if (!open || typeof document === "undefined") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Close on Escape key while the modal is open
  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return {
    isChartModalOpen: open,
    setChartModalOpen: setOpen,
    openModal,
    closeModal,
  };
}
