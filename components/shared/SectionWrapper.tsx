import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function SectionWrapper({ children, className, id }: SectionWrapperProps) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-20 px-4 sm:px-6 lg:px-8", className)}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}

export function SectionHeader({
  title,
  subtitle,
  className,
}: {
  tag?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("text-center mb-14", className)}>
      <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}
