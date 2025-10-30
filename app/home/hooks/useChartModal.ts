'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Manages the chart modal visibility and related side effects.
 * Handles body scroll locking and Escape-key dismissal.
 */
export function useChartModal() {
  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open || typeof document === 'undefined') return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || typeof window === 'undefined') return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return {
    isChartModalOpen: open,
    openModal,
    closeModal,
    setChartModalOpen: setOpen,
  };
}
