import type { LucideIcon } from "lucide-react";
import {
  Award,
  BarChart3,
  BrainCircuit,
  Camera,
  CheckCheck,
  Gift,
  GraduationCap,
  Keyboard,
  TrendingUp,
  Users,
} from "lucide-react";
import type { IconKey } from "@/lib/site-content";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<IconKey, LucideIcon> = {
  math: BrainCircuit,
  typing: Keyboard,
  analytics: BarChart3,
  award: Award,
  certificate: GraduationCap,
  gift: Gift,
  camera: Camera,
  community: Users,
  growth: TrendingUp,
};

type IconTone = "blue" | "orange" | "muted";
type IconContainerVariant = "plain" | "softPill" | "circle";

interface SectionIconProps {
  iconKey: IconKey;
  size?: number;
  tone?: IconTone;
  containerVariant?: IconContainerVariant;
  className?: string;
}

const toneStyles: Record<IconTone, string> = {
  blue: "text-brand-blue",
  orange: "text-orange-500",
  muted: "text-foreground/80",
};

const containerStyles: Record<IconContainerVariant, string> = {
  plain: "",
  softPill: "inline-flex items-center justify-center rounded-xl border border-border/60 bg-background/70 p-2.5",
  circle: "inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 p-2",
};

export function SectionIcon({
  iconKey,
  size = 20,
  tone = "blue",
  containerVariant = "plain",
  className,
}: SectionIconProps) {
  const Icon = ICON_MAP[iconKey] ?? CheckCheck;

  return (
    <span className={cn(containerStyles[containerVariant], className)}>
      <Icon size={size} strokeWidth={2.1} className={cn("shrink-0", toneStyles[tone])} />
    </span>
  );
}

