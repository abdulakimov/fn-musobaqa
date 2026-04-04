"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  preset?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scaleIn";
  staggerIndex?: number;
  disableOnReducedMotion?: boolean;
  mobilePreset?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scaleIn";
  direction?: "up" | "left" | "right";
}

export function ScrollReveal({
  children,
  delay = 0,
  className,
  preset = "fadeUp",
  staggerIndex = 0,
  disableOnReducedMotion = true,
  mobilePreset = "fadeUp",
  direction = "up",
}: ScrollRevealProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const mappedDirectionPreset =
    direction === "left" ? "slideLeft" : direction === "right" ? "slideRight" : "fadeUp";
  const resolvedPreset = isMobile ? mobilePreset : (preset ?? mappedDirectionPreset);
  const resolvedDelay = delay + staggerIndex * 0.06;

  return (
    <div
      className={cn(className)}
      data-preset={resolvedPreset}
      data-delay={resolvedDelay}
      data-disable-reduced-motion={disableOnReducedMotion ? "true" : "false"}
    >
      {children}
    </div>
  );
}
