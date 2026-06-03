import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { TrophyIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIZES = [
  { place: "1-o'rin", amount: "10.000.000 so'm", accent: "from-[#F96933] via-[#FCA41C] to-[#FFD77A]" },
  { place: "2-o'rin", amount: "5.000.000 so'm", accent: "from-[#3D81F7] via-[#4AA4FE] to-[#9FD0FF]" },
  { place: "3-o'rin", amount: "3.000.000 so'm", accent: "from-[#166534] via-[#16A34A] to-[#86EFAC]" },
] as const;

export function PrizesSection() {
  return (
    <SectionWrapper id="prizes" className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#F8FBFF_100%)] py-18">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_120%_at_0%_0%,rgba(249,105,51,0.12),rgba(249,105,51,0)_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_95%_at_100%_30%,rgba(61,129,247,0.14),rgba(61,129,247,0)_52%)]" />

      <div className="relative mx-auto max-w-5xl">
        <ScrollReveal preset="fadeUp" mobilePreset="fadeUp">
          <div className="mb-10 text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#F9C29F] bg-[#FFF1E8] px-4 py-1 text-xs font-semibold tracking-wide text-[#D45520]">
              <TrophyIcon className="h-3.5 w-3.5" />
              Sovrin jamg&apos;armasi
            </p>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              G&apos;oliblar uchun katta yutuqlar
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PRIZES.map((prize, index) => (
            <ScrollReveal key={prize.place} preset="fadeUp" mobilePreset="fadeUp" staggerIndex={index}>
              <div className="group relative overflow-hidden rounded-2xl border border-white/50 bg-white p-6 shadow-[0_12px_30px_rgba(18,30,64,0.08)] transition-transform duration-300 hover:-translate-y-1">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.12)_45%,rgba(255,255,255,0)_70%)] opacity-80" />
                <div
                  className={cn(
                    "pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-95",
                    prize.accent,
                  )}
                />
                <div className="relative space-y-3">
                  <p className="font-display text-lg font-semibold text-foreground/80">{prize.place}</p>
                  <p className="font-display text-3xl font-black leading-tight text-foreground">{prize.amount}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
