// components/charts/ChartWithInfo.tsx
"use client";

import type { ReactNode } from "react";
import HistoricalChart, { Point } from "./HistoricalChart";
import InfoCollapsible from "./InfoCollapsible";

type ChartWithInfoProps = {
  title?: string;            // Chart title shown on the top left
  subtitle?: string;         // Chart subtitle shown on the top right
  data: Point[];             // Historical time series data
  decimals?: number;         // Decimal places for formatting values
  className?: string;        // Optional container className

  infoTitle?: string;        // Collapsible header text
  infoContent?: ReactNode;   // Collapsible body content
  infoDefaultOpen?: boolean; // Whether the collapsible is open by default
};

export default function ChartWithInfo({
  title,
  subtitle,
  data,
  decimals = 4,
  className,
  infoTitle = "About this data",
  // Default info content using your three points translated to concise English
  infoContent = (
    <div className="space-y-2 text-sm text-muted-foreground">
      <p>
        <span className="font-medium">Source:&nbsp;</span>
        Exchange rates come from the Open Exchange Rates (OXR) free public API.
      </p>
      <p>
        <span className="font-medium">Updates:&nbsp;</span>
        Rates update every hour. All times are in UTC, so your local time may differ.
      </p>
      <p>
        <span className="font-medium">Limitations:&nbsp;</span>
        The free plan uses end-of-day rates, which may differ from bank or real-time trading rates.
        For general reference only.
      </p>
    </div>
  ),
  infoDefaultOpen = true,
}: ChartWithInfoProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-card text-card-foreground ${
        className ?? ""
      }`}
    >
      <HistoricalChart
        title={title}
        subtitle={subtitle}
        data={data}
        decimals={decimals}
        className="rounded-none border-0 shadow-none"
      />
      <InfoCollapsible
        title={infoTitle}
        defaultOpen={infoDefaultOpen}
        className="border-t"
      >
        {infoContent}
      </InfoCollapsible>
    </div>
  );
}
