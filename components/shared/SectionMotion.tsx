interface SectionMotionProps {
  children: React.ReactNode;
  className?: string;
  preset?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scaleIn";
  delay?: number;
}

export function SectionMotion({
  children,
  className,
  preset = "fadeUp",
  delay = 0,
}: SectionMotionProps) {
  return (
    <div className={className} data-preset={preset} data-delay={delay}>
      {children}
    </div>
  );
}
