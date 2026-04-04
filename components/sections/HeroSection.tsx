"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ParticleBackground } from "@/components/shared/ParticleBackground";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import type { HeroContent, SiteContent } from "@/lib/site-content";

const COMPETITION_DATE = process.env.NEXT_PUBLIC_COMPETITION_DATE ?? "2026-04-16T09:00:00+05:00";

interface HeroSectionProps {
  data: HeroContent | null;
  content?: SiteContent;
}

export function HeroSection({ data, content }: HeroSectionProps) {
  const heroTitle = data?.title ?? "Farg'onada Matematika va Typing Musobaqasi";
  const titleSegments = heroTitle.split(/(Matematika|Typing)/gi);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  useEffect(() => {
    const onScroll = () => setShowScrollIndicator(window.scrollY < 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#F3F4FF] via-white to-white px-4">
      <ParticleBackground />
      <div className="hero-blob hero-blob-a" />
      <div className="hero-blob hero-blob-b" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_72%_52%_at_50%_-5%,rgba(61,129,247,0.18),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_12%_86%,rgba(74,164,254,0.14),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_85%_110%,rgba(249,105,51,0.08),transparent)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center pb-26 pt-28 text-center sm:pb-16 sm:pt-24">
        <h1 className="mb-9 font-hero text-4xl font-extrabold leading-[0.95] tracking-tight uppercase sm:mb-10 sm:text-6xl md:text-7xl">
          {titleSegments.map((segment, index) => {
            const normalized = segment.toLowerCase();
            const isOrange = normalized === "matematika" || normalized === "typing";
            return (
              <span key={`${segment}-${index}`} className={isOrange ? "gradient-text-orange" : "gradient-text"}>
                {segment}
              </span>
            );
          })}
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:mb-9 sm:text-xl">
          {data?.subtitle ?? "Robbit akademiyasi tomonidan yoshlarning analitik fikrlashi va klaviatura tezligini sinovdan o'tkazadigan yirik mintaqaviy musobaqa"}
        </p>

        <div className="mb-12 flex flex-col items-center gap-3 sm:mb-14">
          <CountdownTimer targetDate={data?.registrationDeadline ?? data?.competitionDate ?? COMPETITION_DATE} />
        </div>

        <div className="mb-3 flex flex-col items-center justify-center gap-4 sm:mb-0 sm:flex-row">
          <Link
            href="/register"
            className="group relative inline-flex h-14 w-[260px] items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/40 bg-[linear-gradient(135deg,#F96933_0%,#FCA41C_100%)] px-10 text-lg font-bold text-white shadow-[0_10px_24px_rgba(249,105,51,0.2)] transition-[box-shadow,border-color] duration-300 hover:border-white/55 hover:shadow-[0_14px_30px_rgba(249,105,51,0.26)]"
          >
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.06)_36%,rgba(255,255,255,0)_68%)]" />
            {data?.ctaText ?? "Ro'yxatdan o'tish"}
            <ArrowRightIcon className="arrow-hover-nudge h-4 w-4" />
          </Link>
          <a
            href="#about"
            className={buttonVariants({
              size: "lg",
              variant: "outline",
              className: "h-14 w-[260px] rounded-xl border-border bg-transparent px-10 text-lg font-bold hover:border-border hover:bg-transparent sm:mt-0",
            })}
          >
            {data?.ctaSecondaryText ?? "Batafsil ma'lumot"}
          </a>
        </div>
      </div>

      {showScrollIndicator && (
        <a
          href="#about"
          className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 rounded-md px-2 py-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue/60 sm:bottom-8 sm:gap-2"
          aria-label={content?.heroScrollLabel ? `${content.heroScrollLabel} bo'limiga o'tish` : "Pastga bo'limiga o'tish"}
        >
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {content?.heroScrollLabel ?? "Pastga"}
          </span>
          <div className="scroll-indicator flex h-10 w-6 items-start justify-center rounded-full border border-border p-1.5 sm:h-11 sm:w-7">
            <div className="scroll-indicator-dot h-2 w-1.5 rounded-full bg-electric-blue" />
          </div>
        </a>
      )}
    </section>
  );
}
