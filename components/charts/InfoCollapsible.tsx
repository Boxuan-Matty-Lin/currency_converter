// components/charts/InfoCollapsible.tsx
"use client";

import * as React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Info } from "lucide-react";

type InfoCollapsibleProps = {
  title?: string;           // Header text shown on the trigger row
  defaultOpen?: boolean;    // Whether the collapsible is open by default
  className?: string;       // Optional container className
  children: React.ReactNode; // Body content rendered inside the collapsible
};

export default function InfoCollapsible({
  title = "Data notes & provenance",
  defaultOpen = true,
  className,
  children,
}: InfoCollapsibleProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  React.useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={className}>
      <CollapsibleTrigger
        className="group flex w-full items-center justify-between border-t bg-muted/40 px-3 py-2 text-sm transition hover:bg-muted/60"
      >
        <span className="flex items-center gap-2 font-medium text-muted-foreground">
          <Info className="h-4 w-4 text-primary" />
          {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="border-t bg-muted/30 px-3 pb-3 pt-2 text-sm text-muted-foreground">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
