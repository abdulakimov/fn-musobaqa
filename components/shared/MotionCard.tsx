"use client";

import { cn } from "@/lib/utils";

interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
}

export function MotionCard({ children, className }: MotionCardProps) {
  return <div className={cn(className)}>{children}</div>;
}
