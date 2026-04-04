"use client";

import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface FormProgressProps {
  steps: string[];
  current: number;
}

export function FormProgress({ steps, current }: FormProgressProps) {
  return (
    <nav className="mb-8 sm:mb-10" aria-label="Form progress">
      <ol className="flex items-start" role="list">
        {steps.map((step, i) => (
          <li key={step} className="flex min-w-0 flex-1 items-start">
            <div className="flex min-w-0 w-full flex-col items-center">
              <div
                aria-current={i === current ? "step" : undefined}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                  "transition-all duration-300",
                  i < current
                    ? "border-border bg-electric-blue text-background"
                    : i === current
                      ? "border-border bg-electric-blue/10 text-electric-blue"
                      : "border-border text-muted-foreground"
                )}
              >
                {i < current ? <CheckIcon className="h-4 w-4" /> : <span>{i + 1}</span>}
              </div>
              <span
                className={cn(
                  "mt-2 line-clamp-1 text-center text-[11px] font-medium leading-tight sm:text-xs",
                  i <= current ? "text-electric-blue" : "text-muted-foreground"
                )}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 mt-5 h-[2px] min-w-4 flex-1",
                  i < current ? "bg-electric-blue" : "bg-border"
                )}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
