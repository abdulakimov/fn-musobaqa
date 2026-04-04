import Link from "next/link";
import Image from "next/image";
import brandLogo from "@/assets/logo/logo.png";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { Separator } from "@/components/ui/separator";
import { MapPinIcon, PhoneIcon, MailIcon, GlobeIcon } from "lucide-react";
import type { SiteContent, SiteSettings } from "@/lib/site-content";

interface FooterSectionProps {
  settings?: SiteSettings;
  content?: SiteContent;
}

type SocialPlatform = "telegram" | "instagram" | "youtube";

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  if (platform === "telegram") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 4 3.8 10.6a.7.7 0 0 0 .04 1.33l4.76 1.47 2 6.15a.7.7 0 0 0 1.2.25l2.7-3.03 4.72 3.53a.7.7 0 0 0 1.1-.43L22 4.87A.7.7 0 0 0 21 4Z" />
        <path d="m8.7 13.4 9.53-6.22" />
      </svg>
    );
  }

  if (platform === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="3.8" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2.5" y="5.5" width="19" height="13" rx="3.2" />
      <path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

const DEFAULT_LINKS = [
  { href: "#about", label: "Musobaqa haqida" },
  { href: "#nominations", label: "Yo'nalishlar" },
  { href: "#timeline", label: "Taqvim" },
  { href: "#requirements", label: "Shartlar" },
  { href: "#faq", label: "FAQ" },
  { href: "/register", label: "Ro'yxatdan o'tish" },
];

export function FooterSection({ settings, content }: FooterSectionProps) {
  const logoSrc = settings?.logoUrl ?? brandLogo;
  const siteName = settings?.siteName ?? "Robbit Akademiyasi";
  const phone = settings?.phone ?? "78-777-3-777";
  const email = settings?.email ?? "info@robbit.uz";
  const website = settings?.website ?? "robbit.uz";
  const address = settings?.address ?? "Farg'ona viloyati, Farg'ona shahri";
  const socials = [
    { label: "Telegram", href: settings?.telegram ?? "https://t.me/robbituz", platform: "telegram" as const },
    { label: "Instagram", href: settings?.instagram ?? "https://www.instagram.com/robbituz/", platform: "instagram" as const },
    { label: "YouTube", href: settings?.youtube ?? "https://www.youtube.com/@Robbituz", platform: "youtube" as const },
  ];
  const quickLinks = content?.footerQuickLinks?.length ? content.footerQuickLinks : DEFAULT_LINKS;

  return (
    <footer className="border-t border-border bg-card/50">
      <SectionWrapper className="py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center">
              <Image
                src={logoSrc}
                alt={siteName}
                width={110}
                height={32}
                className="object-contain"
                unoptimized={typeof logoSrc === "string" && logoSrc.endsWith(".svg")}
              />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {content?.footerDescription ?? "Robbit akademiyasi 6 yoshdan 15 yoshgacha bo'lgan bolalarga Robototexnika va IT bo'yicha dars beradigan o'quv markazi."}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-electric-blue">
              {content?.footerQuickLinksTitle ?? "Tezkor havolalar"}
            </h4>
            <ul className="space-y-2">
              {quickLinks.map(({ href, label }) => (
                <li key={`${href}-${label}`}>
                  <Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-electric-blue">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-electric-blue">
              {content?.footerContactTitle ?? "Bog'lanish"}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-electric-blue" />
                {address}
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <PhoneIcon className="h-4 w-4 shrink-0 text-electric-blue" />
                <a href={`tel:${phone.replace(/\D/g, "")}`} className="transition-colors hover:text-electric-blue">{phone}</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <MailIcon className="h-4 w-4 shrink-0 text-electric-blue" />
                <a href={`mailto:${email}`} className="transition-colors hover:text-electric-blue">{email}</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <GlobeIcon className="h-4 w-4 shrink-0 text-electric-blue" />
                <a href={`https://${website}`} target="_blank" rel="noreferrer" className="transition-colors hover:text-electric-blue">
                  {website}
                </a>
              </li>
            </ul>
            <div className="flex gap-3 pt-2">
              {socials.map(({ label, href, platform }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-electric-blue/40 hover:text-electric-blue"
                  aria-label={label}
                >
                  <SocialIcon platform={platform} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <p>{content?.footerCopyrightText ?? `© 2026 ${siteName}. Barcha huquqlar himoyalangan.`}</p>
          <p>{content?.footerEventText ?? "Farg'ona Matematika va Typing musobaqasi - 18-19-aprel 2026"}</p>
        </div>
      </SectionWrapper>
    </footer>
  );
}
