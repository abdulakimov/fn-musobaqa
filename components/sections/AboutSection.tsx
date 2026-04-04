import { SectionWrapper, SectionHeader } from "@/components/shared/SectionWrapper";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { MotionCard } from "@/components/shared/MotionCard";
import { SectionIcon } from "@/components/shared/icon-map";
import type { AboutContent, IconKey } from "@/lib/site-content";

const DEFAULT_STATS = [
  { label: "Ishtirokchi", value: 1300, suffix: "+" },
  { label: "Sovrin (so'm)", value: 54000000, suffix: "" },
  { label: "Musobaqa qiymati (so'm)", value: 200000000, suffix: "" },
];

const DEFAULT_DESCRIPTION = `Robbit Akademiyasi yoshlar uchun matematika va typing yo'nalishlarida amaliy bellashuvlar tashkil etadigan ta'lim platformasi. Musobaqada analitik fikrlash, tezkor hisob-kitob va klaviaturada aniq yozish ko'nikmalari baholanadi.

Matematika yo'nalishi 9-11 va 12-14 yosh guruhlari uchun alohida o'tkaziladi. Typing yo'nalishi esa umumiy 9-14 yoshlar uchun tashkil etiladi.`;

const DEFAULT_FEATURES = [
  { iconKey: "math", title: "Matematika", desc: "Mantiqiy va arifmetik masalalar yechimi" },
  { iconKey: "typing", title: "Typing", desc: "Tezlik va xatosiz yozish bellashuvi" },
  { iconKey: "analytics", title: "Aniq baholash", desc: "Natijalar shaffof baholanadi" },
  { iconKey: "award", title: "Sovrinlar", desc: "G'oliblar uchun mukofotlar va sertifikatlar" },
];

interface AboutSectionProps {
  data: AboutContent | null;
}

export function AboutSection({ data }: AboutSectionProps) {
  const stats = (data?.stats?.length ? data.stats : DEFAULT_STATS) as Array<{
    label: string;
    value: number;
    suffix?: string;
  }>;
  const highlightStat = stats.find((stat) => stat.label.toLowerCase().includes("musobaqa qiymati"));
  const regularStats = stats.filter((stat) => stat !== highlightStat);
  const description = data?.description || DEFAULT_DESCRIPTION;
  const features = (data?.features?.length ? data.features : DEFAULT_FEATURES) as Array<{
    iconKey: IconKey;
    title: string;
    desc: string;
  }>;

  return (
    <SectionWrapper id="about">
      <SectionHeader
        tag={data?.sectionTag ?? "Musobaqa haqida"}
        title={data?.sectionTitle ?? "Matematika va Typing bo'yicha katta bellashuv"}
        subtitle={
          data?.sectionSubtitle ??
          "Robbit Akademiyasi Farg'ona viloyatidagi matematika va typing musobaqasini tashkillashtiryapti"
        }
      />

      {highlightStat ? (
        <div className="mx-auto mb-5 w-full max-w-3xl">
          <ScrollReveal preset="scaleIn">
            <MotionCard className="card-hover ui-surface relative flex min-h-[170px] flex-col items-center justify-center overflow-hidden border-orange-300/50 bg-gradient-to-br from-orange-100/70 via-orange-50/45 to-white p-7 text-center">
              <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-gradient-to-br from-orange-300/45 to-orange-500/20 blur-2xl" />
              <div className="relative z-10 mb-2 whitespace-nowrap bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 bg-clip-text font-hero text-[2.7rem] font-extrabold leading-none tracking-tight text-transparent sm:text-[3.1rem]">
                <AnimatedCounter target={highlightStat.value} suffix={highlightStat.suffix} />
              </div>
              <div className="relative z-10 text-base font-medium text-orange-700/90">{highlightStat.label}</div>
            </MotionCard>
          </ScrollReveal>
        </div>
      ) : null}

      <div
        className={`mx-auto mb-12 grid w-full max-w-5xl grid-cols-1 gap-5 ${regularStats.length > 1 ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}
      >
        {regularStats.map((stat, i) => (
          <ScrollReveal key={stat.label} staggerIndex={i} preset="scaleIn">
            <MotionCard className="card-hover ui-surface flex min-h-[156px] flex-col items-center justify-center p-6 text-center">
              <div className="gradient-text mb-2 whitespace-nowrap font-hero text-[2.5rem] font-extrabold leading-none tracking-tight sm:text-[2.8rem]">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-base text-muted-foreground">{stat.label}</div>
            </MotionCard>
          </ScrollReveal>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.08fr_1fr] lg:gap-12">
        <ScrollReveal preset="slideLeft">
          <div className="max-w-[560px] space-y-5">
            {description
              .trim()
              .split("\n\n")
              .filter(Boolean)
              .map((para, i) => (
                <p key={i} className="text-[1.04rem] leading-8 text-muted-foreground">
                  {para.trim()}
                </p>
              ))}
          </div>
        </ScrollReveal>

        <ScrollReveal preset="slideRight" delay={0.1}>
          <div className="grid grid-cols-2 gap-5">
            {features.map((item, i) => (
              <ScrollReveal key={item.title} staggerIndex={i} preset="scaleIn" mobilePreset="fadeUp">
                <MotionCard className="card-hover ui-surface h-full min-h-[142px] p-5">
                  <div className="mb-3">
                    <SectionIcon iconKey={item.iconKey} size={20} tone="blue" containerVariant="softPill" />
                  </div>
                  <h4 className="mb-1.5 text-base font-display font-semibold">{item.title}</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </MotionCard>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </SectionWrapper>
  );
}
