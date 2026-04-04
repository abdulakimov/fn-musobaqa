import { SectionWrapper, SectionHeader } from "@/components/shared/SectionWrapper";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { MotionCard } from "@/components/shared/MotionCard";
import { cn } from "@/lib/utils";
import type { TimelineEvent, SectionMeta, SiteContent } from "@/lib/site-content";
import { CheckCircle2Icon, CircleIcon } from "lucide-react";

const DEFAULT_EVENTS: TimelineEvent[] = [
  {
    _id: "1",
    title: "Ro'yxatdan o'tish boshlandi",
    date: "2026-01-15",
    description: "Musobaqa uchun rasmiy ro'yxatdan o'tish boshlanadi. Online ariza to'ldiring.",
    status: "completed",
    order: 1,
  },
  {
    _id: "2",
    title: "Ro'yxatdan o'tish yakunlanadi",
    date: "2026-04-01",
    description: "So'nggi muddatgacha ro'yxatdan o'tishni unutmang. O'rinlar cheklangan!",
    status: "upcoming",
    order: 2,
  },
  {
    _id: "3",
    title: "Musobaqa kuni",
    date: "2026-04-16",
    description: "Katta kun! Ishtirokchilar ertalab soat 9:00 da joyga yetib kelishlari shart.",
    status: "upcoming",
    order: 3,
  },
  {
    _id: "4",
    title: "G'oliblar e'loni",
    date: "2026-04-16",
    description: "Musobaqa yakuni va g'oliblarni mukofotlash marosimi.",
    status: "upcoming",
    order: 4,
  },
];

function formatDate(dateStr: string, locale = "uz-UZ") {
  return new Date(dateStr).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function parseDateOnly(dateStr: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  return new Date(year, month, day);
}

function getDerivedStatuses(events: TimelineEvent[]): TimelineEvent["status"][] {
  const days = events.map((event) => parseDateOnly(event.date));
  if (days.some((day) => day === null)) {
    return events.map((event) => event.status);
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let activeIndex = -1;
  for (let i = 0; i < days.length; i += 1) {
    const start = days[i] as Date;
    const end = i < days.length - 1 ? (days[i + 1] as Date) : null;

    if (today >= start && (!end || today < end)) {
      activeIndex = i;
      break;
    }
  }

  if (activeIndex === -1 && today >= (days[days.length - 1] as Date)) {
    activeIndex = days.length - 1;
  }

  return events.map((_, index) => {
    if (activeIndex === -1) return "upcoming";
    if (index < activeIndex) return "completed";
    if (index === activeIndex) return "current";
    return "upcoming";
  });
}

interface TimelineSectionProps {
  events: TimelineEvent[];
  meta?: SectionMeta | null;
  content?: SiteContent;
}

export function TimelineSection({ events, meta, content }: TimelineSectionProps) {
  const list = events.length > 0 ? events : DEFAULT_EVENTS;
  const derivedStatuses = getDerivedStatuses(list);

  return (
    <SectionWrapper id="timeline">
      <SectionHeader
        tag={meta?.sectionTag ?? "Taqvim"}
        title={meta?.sectionTitle ?? "Muhim sanalar"}
        subtitle={meta?.sectionSubtitle ?? "Musobaqa jarayonidagi asosiy bosqichlar"}
      />

      <div className="relative mx-auto max-w-3xl">
        <div className="absolute bottom-6 left-5 top-6 w-px -translate-x-1/2 bg-border sm:left-1/2" />
        <div className="space-y-8">
          {list.map((event, i) => {
            const status = derivedStatuses[i];
            const Icon =
              status === "completed" || status === "current"
                ? CheckCircle2Icon
                : CircleIcon;
            const iconClass =
              status === "completed"
                ? "border-border bg-green-500/10 text-[#16A34A]"
                : status === "current"
                  ? "border-border bg-electric-blue/12 text-electric-blue"
                  : "border-border bg-card text-muted-foreground";
            const isRight = i % 2 === 1;

            return (
              <ScrollReveal
                key={event._id}
                staggerIndex={i}
                preset={isRight ? "slideRight" : "slideLeft"}
                mobilePreset="fadeUp"
              >
                <div className={cn("relative pl-14 sm:flex sm:justify-center sm:pl-0")}>
                  <div
                    className={cn(
                      "absolute left-5 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 sm:left-1/2",
                      iconClass
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <MotionCard
                    className={cn(
                      "w-full rounded-xl border border-border bg-card p-5 sm:w-5/12",
                      isRight
                        ? "sm:ml-auto sm:mr-[calc(50%+2rem)]"
                        : "sm:mr-auto sm:ml-[calc(50%+2rem)]"
                    )}
                  >
                    <p className="mb-1 text-xs font-semibold text-electric-blue">
                      {formatDate(event.date, content?.timelineDateLocale ?? "uz-UZ")}
                    </p>
                    <h4 className="mb-2 font-display font-semibold">{event.title}</h4>
                    {event.description && (
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                  </MotionCard>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}

