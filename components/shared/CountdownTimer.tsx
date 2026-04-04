"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(targetDate: string): TimeLeft {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

interface CountdownTimerProps {
  targetDate: string;
  className?: string;
}

export function CountdownTimer({ targetDate, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const units = [
    { label: "Kun", value: timeLeft.days },
    { label: "Soat", value: timeLeft.hours },
    { label: "Daqiqa", value: timeLeft.minutes },
    { label: "Soniya", value: timeLeft.seconds },
  ];

  return (
    <div className={cn("flex gap-4 sm:gap-5", className)}>
      {units.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col items-center min-w-[78px] sm:min-w-[96px] bg-white/28 backdrop-blur-[4px] border border-border rounded-xl p-4 sm:p-5"
        >
          <span suppressHydrationWarning className="gradient-text font-hero text-4xl font-extrabold sm:text-5xl tabular-nums leading-none">
            {String(value).padStart(2, "0")}
          </span>
          <span className="mt-2 text-xs text-muted-foreground sm:text-sm">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
