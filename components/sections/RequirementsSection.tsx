import { SectionWrapper, SectionHeader } from "@/components/shared/SectionWrapper";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { MotionCard } from "@/components/shared/MotionCard";
import { SectionIcon } from "@/components/shared/icon-map";
import { CheckIcon, XCircleIcon } from "lucide-react";
import type { RequirementsSectionContent } from "@/lib/site-content";

const DEFAULT_REQUIREMENTS = [
  { text: "9-11 yoki 12-14 yosh toifasidagi o'quvchi bo'lish", required: true },
  { text: "Ota-ona yoki vasiy hamrohligida kelish", required: true },
  { text: "Tug'ilganlik haqida ma'lumotnoma (original yoki nusxa)", required: true },
  { text: "3x4 sm foto (ro'yxatdan o'tish uchun)", required: true },
  { text: "Musobaqa kuni belgilangan vaqtda kelish", required: true },
  { text: "Shaxsiy qurilma olib kelish", required: false },
  { text: "Oldindan maxsus bilim talab qilinmaydi", required: false },
];

const DEFAULT_BENEFITS = [
  { iconKey: "certificate", text: "Akademiya uchun sertifikat va imtiyozlar" },
  { iconKey: "award", text: "Barcha ishtirokchilarga qatnashish sertifikati" },
  { iconKey: "gift", text: "Ishtirokchilarga sovg'alar va esdalik buyumlar" },
  { iconKey: "camera", text: "Professional fotosurat va video suratga olish" },
  { iconKey: "community", text: "Yangi do'stlar va tengdoshlar bilan tanishish" },
  { iconKey: "growth", text: "Ko'nikmalarni real sinovda baholash" },
] as const;

interface RequirementsSectionProps {
  data: RequirementsSectionContent | null;
}

export function RequirementsSection({ data }: RequirementsSectionProps) {
  const requirements = data?.requirements?.length ? data.requirements : DEFAULT_REQUIREMENTS;
  const benefits = data?.benefits?.length ? data.benefits : DEFAULT_BENEFITS;
  const optionalPrefix = data?.optionalPrefix ?? "Majburiy emas";

  return (
    <SectionWrapper id="requirements" className="bg-muted/20 py-16 sm:py-20">
      <SectionHeader
        tag={data?.sectionTag ?? "Shartlar va imtiyozlar"}
        title={data?.sectionTitle ?? "Kimlar ishtirok eta oladi?"}
        subtitle={data?.sectionSubtitle ?? "Musobaqada qatnashish uchun minimal talablar"}
        className="mx-auto mb-10 max-w-2xl"
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <ScrollReveal preset="slideLeft" mobilePreset="fadeUp">
          <MotionCard className="ui-surface h-full p-6 sm:p-7">
            <h3 className="mb-5 text-xl font-display font-semibold text-electric-blue">{data?.requirementsTitle ?? "Talablar"}</h3>
            <ul className="space-y-2.5">
              {requirements.map(({ text, required }) => (
                <li key={text} className="ui-surface-soft flex items-start gap-3 px-3 py-2.5">
                  {required ? (
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-blue/12 text-brand-blue">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    <XCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <span className={required ? "text-sm leading-relaxed text-foreground" : "text-sm leading-relaxed text-muted-foreground"}>
                    {required ? text : `${optionalPrefix}: ${text}`}
                  </span>
                </li>
              ))}
            </ul>
          </MotionCard>
        </ScrollReveal>

        <ScrollReveal preset="slideRight" staggerIndex={1} mobilePreset="fadeUp">
          <MotionCard className="ui-surface h-full p-6 sm:p-7">
            <h3 className="mb-5 text-xl font-display font-semibold text-secondary-foreground">{data?.benefitsTitle ?? "Nima olasiz?"}</h3>
            <ul className="space-y-2.5">
              {benefits.map(({ iconKey, text }) => (
                <li key={text} className="ui-surface-soft flex items-center gap-3 px-3 py-2.5">
                  <SectionIcon iconKey={iconKey} size={16} tone="orange" containerVariant="circle" />
                  <span className="text-sm leading-relaxed text-foreground">{text}</span>
                </li>
              ))}
            </ul>
          </MotionCard>
        </ScrollReveal>
      </div>
    </SectionWrapper>
  );
}
