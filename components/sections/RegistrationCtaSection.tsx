"use client";

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import type { CtaSectionContent } from "@/lib/site-content";

interface RegistrationCtaSectionProps {
  data: CtaSectionContent | null;
}

export function RegistrationCtaSection({ data }: RegistrationCtaSectionProps) {
  return (
    <section className="relative overflow-hidden px-4 py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(249,91,56,0.05),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_80%,rgba(80,80,255,0.04),transparent)]" />

      <div className="mx-auto max-w-3xl text-center">
        <h2 className="gradient-text mb-6 font-hero text-4xl font-black leading-tight uppercase sm:text-5xl md:text-6xl">
          {data?.title ?? "Hoziroq Ro'yxatdan O'ting!"}
        </h2>

        <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
          {data?.subtitle ?? "18-19-aprel 2026-yil, Farg'ona viloyatida o'tkaziladi."}{" "}
          {data?.deadlinePrefixText ?? "Ro'yxatdan o'tish muddati:"}{" "}
          <span className="font-semibold text-[#F96933]">{data?.deadline ?? "2026-yil 1-aprel"}</span>{" "}
          {data?.deadlineSuffixText ?? "kuni yakunlanadi."}
        </p>

        <div>
          <Link
            href="/register"
            className="group relative inline-flex h-14 min-w-[280px] items-center justify-center gap-2 whitespace-nowrap overflow-hidden rounded-xl border border-white/40 bg-[linear-gradient(135deg,#F96933_0%,#FCA41C_100%)] px-10 text-lg font-bold text-white shadow-[0_10px_24px_rgba(249,105,51,0.2)] transition-[box-shadow,border-color] duration-300 hover:border-white/55 hover:shadow-[0_14px_30px_rgba(249,105,51,0.26)]"
          >
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.06)_36%,rgba(255,255,255,0)_68%)]" />
            {data?.ctaText ?? "Ro'yxatdan o'tish"}
            <ArrowRightIcon className="arrow-hover-nudge h-5 w-5" />
          </Link>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          {data?.note ?? "Bepul ishtirok • Onlayn ariza • Taxminan 3 daqiqa"}
        </p>
      </div>
    </section>
  );
}
