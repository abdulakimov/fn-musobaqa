"use client";

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
}

function formatWithSpaces(value: number) {
  const normalized = Math.round(value).toString();
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
}

export function AnimatedCounter({ target, suffix = "", prefix = "" }: AnimatedCounterProps) {
  return (
    <span>
      {prefix}
      {formatWithSpaces(target)}
      {suffix}
    </span>
  );
}
