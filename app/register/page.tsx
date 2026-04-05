import type { Metadata } from "next";
import Link from "next/link";
import { RegistrationForm } from "@/components/forms/RegistrationForm";
import { ArrowLeftIcon } from "lucide-react";
import { SectionMotion } from "@/components/shared/SectionMotion";
import { STATIC_SITE_CONTENT } from "@/lib/site-content";

export function generateMetadata(): Metadata {
  const siteContent = STATIC_SITE_CONTENT;
  return {
    title: siteContent?.seo?.registerTitle ?? "Ro'yxatdan o'tish | Matematika va Typing Musobaqasi 2026",
    description:
      siteContent?.seo?.registerDescription ?? "Farg'ona Matematika va Typing Musobaqasiga ro'yxatdan o'ting. 18-19-aprel 2026.",
  };
}

export default function RegisterPage() {
  const registerPage = STATIC_SITE_CONTENT?.registerPage;
  const normalizedTitle = registerPage?.title?.trim().toLowerCase();
  const registerTitle =
    normalizedTitle === "musobaqaga kirish" ? "Ro'yxatdan o'tish" : registerPage?.title ?? "Ro'yxatdan o'tish";

  return (
    <main id="main-content" className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_76%_38%_at_50%_0%,rgba(61,129,247,0.10),transparent)]" />

      <div className="relative z-10 px-4 py-10 sm:py-14">
        {/* Back link */}
        <SectionMotion preset="fadeIn" className="mx-auto mb-8 max-w-2xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-electric-blue transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            {registerPage?.backLinkText ?? "Bosh sahifaga qaytish"}
          </Link>
        </SectionMotion>

        {/* Header */}
        <SectionMotion preset="fadeUp" delay={0.06} className="mx-auto mb-10 max-w-2xl text-center">
          <h1 className="gradient-text mb-3 font-hero text-3xl leading-tight font-black sm:text-4xl">
            {registerTitle}
          </h1>
          <p className="text-muted-foreground text-sm">
            {registerPage?.subtitle ?? "18-19-aprel 2026 | Farg'ona viloyati"}
          </p>
        </SectionMotion>

        {/* Form */}
        <SectionMotion preset="scaleIn" delay={0.12}>
          <RegistrationForm content={STATIC_SITE_CONTENT?.registerForm} />
        </SectionMotion>

        {/* Footer note */}
        <SectionMotion preset="fadeIn" delay={0.18}>
          <p className="text-center text-xs text-muted-foreground mt-8 max-w-md mx-auto">
            {registerPage?.helpPrefixText ?? registerPage?.helpText ?? "Savolingiz bormi?"}{" "}
            <a href={`tel:${(registerPage?.helpPhone ?? "78-777-3-777").replace(/\D/g, "")}`} className="text-electric-blue hover:underline">
              {registerPage?.helpPhone ?? "78-777-3-777"}
            </a>{" "}
            {registerPage?.helpCallToActionText ?? "ga qo'ng'iroq qiling yoki"}{" "}
            <a href={registerPage?.helpTelegramUrl ?? "https://t.me/robbituz"} className="text-electric-blue hover:underline">
              {registerPage?.helpTelegramText ?? "Telegram"}
            </a>
            {registerPage?.helpSuffixText ?? "ga yozing."}
          </p>
        </SectionMotion>
      </div>
    </main>
  );
}
