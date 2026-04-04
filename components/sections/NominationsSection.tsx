import { SectionHeader, SectionWrapper } from "@/components/shared/SectionWrapper";
import { MotionCard } from "@/components/shared/MotionCard";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionIcon } from "@/components/shared/icon-map";
import { cn } from "@/lib/utils";
import type { NominationsSectionContent, SiteContent } from "@/lib/site-content";

const DEFAULT_NOMINATIONS = [
  {
    ageGroup: "9-14 yosh",
    title: "Matematika",
    iconKey: "math",
    badge: "Asosiy yo'nalish",
    description: "9-11 va 12-14 yosh guruhlari uchun mantiqiy va arifmetik masalalar bo'yicha bellashuv.",
    tasks: ["Arifmetik test", "Mantiqiy masalalar", "Analitik yechim va aniqlik"],
    colorAccent: "blue",
  },
  {
    ageGroup: "9-14 yosh",
    title: "Typing",
    iconKey: "typing",
    badge: "Tezlik",
    description: "Typing yo'nalishi 9-14 yosh toifasi uchun alohida reytingda o'tadi.",
    tasks: ["Tezlik sinovi", "Xatolar ko'rsatkichi", "Final reytingi"],
    colorAccent: "blue",
  },
] as const;

const ACCENT_STYLES = {
  green: {
    border: "hover:border-electric-blue/30",
    bullet: "bg-green-500",
  },
  blue: {
    border: "hover:border-electric-blue/30",
    bullet: "bg-electric-blue",
  },
  orange: {
    border: "hover:border-electric-blue/30",
    bullet: "bg-orange-500",
  },
} as const;

interface NominationsSectionProps {
  data: NominationsSectionContent | null;
  content?: SiteContent;
}

export function NominationsSection({ data, content }: NominationsSectionProps) {
  const nominations = data?.nominations?.length ? data.nominations : DEFAULT_NOMINATIONS;
  const tasksTitle = data?.tasksTitle ?? content?.nominationsTasksLabel ?? "Bellashuv bloklari";

  return (
    <SectionWrapper id="nominations" className="bg-muted/20">
      <SectionHeader
        tag={data?.sectionTag ?? "Yo'nalishlar"}
        title={data?.sectionTitle ?? "2 ta yo'nalish va 2 ta yosh toifasi"}
        subtitle={
          data?.sectionSubtitle ??
          "Har bir ishtirokchi Matematika yoki Typing yo'nalishini tanlaydi"
        }
      />

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
        {nominations.map((nomination, i) => {
          const accent = ACCENT_STYLES[nomination.colorAccent] ?? ACCENT_STYLES.blue;
          const isMathCard = nomination.title.toLowerCase() === "matematika";
          const isTypingCard = nomination.title.toLowerCase() === "typing";

          return (
            <ScrollReveal
              key={`${nomination.ageGroup}-${nomination.title}`}
              preset={i % 2 === 0 ? "slideLeft" : "slideRight"}
              mobilePreset="fadeUp"
              staggerIndex={i}
            >
              <MotionCard
                className={cn(
                  "ui-surface relative h-full min-h-[440px] overflow-hidden border-white/45 bg-white/76 p-7 shadow-[0_12px_28px_rgba(61,129,247,0.06)] backdrop-blur-[1px] transition-all",
                  accent.border
                )}
              >
                {isMathCard && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.2)_0%,rgba(249,105,51,0.1)_45%,rgba(252,164,28,0.04)_70%,rgba(252,164,28,0)_100%)]" />
                    <div className="pointer-events-none absolute -right-16 -top-20 h-60 w-72 rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(249,105,51,0.34),rgba(252,164,28,0.14)_55%,rgba(252,164,28,0)_100%)]" />
                  </>
                )}
                {isTypingCard && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.2)_0%,rgba(74,156,250,0.12)_45%,rgba(61,129,247,0.06)_70%,rgba(61,129,247,0)_100%)]" />
                    <div className="pointer-events-none absolute -right-16 -top-20 h-60 w-72 rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(74,156,250,0.28),rgba(61,129,247,0.12)_55%,rgba(61,129,247,0)_100%)]" />
                  </>
                )}

                <div className="relative z-10 mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-medium text-muted-foreground">{nomination.ageGroup}</p>
                    <h3 className="mt-2 font-display text-3xl font-bold">{nomination.title}</h3>
                  </div>
                  <SectionIcon
                    iconKey={nomination.iconKey}
                    size={22}
                    tone={isMathCard ? "orange" : "blue"}
                    containerVariant="softPill"
                    className="backdrop-blur-[0.5px]"
                  />
                </div>

                <p className="relative z-10 mb-6 text-lg leading-relaxed text-foreground/85">{nomination.description}</p>

                <div className="relative z-10">
                  <p className="mb-3 text-xl font-medium text-foreground/80">{tasksTitle}</p>
                  <ul className="space-y-3">
                    {nomination.tasks.map((task) => (
                      <li key={task} className="flex items-start gap-3 text-lg text-foreground">
                        <span className={cn("mt-2.5 h-2 w-2 shrink-0 rounded-full", accent.bullet)} />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </MotionCard>
            </ScrollReveal>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
