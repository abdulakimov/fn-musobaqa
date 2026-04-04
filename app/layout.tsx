import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { STATIC_SITE_CONTENT } from "@/lib/site-content";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export function generateMetadata(): Metadata {
  const siteContent = STATIC_SITE_CONTENT;
  return {
    title: siteContent?.seo?.homeTitle ?? "Farg'ona Matematika va Typing Musobaqasi 2026 | Robbit Akademiyasi",
    description:
      siteContent?.seo?.homeDescription ??
      "Robbit Akademiyasi tomonidan tashkillashtirilgan Farg'ona Matematika va Typing Musobaqasiga hoziroq ro'yxatdan o'ting. 9-11 va 12-14 yoshdagi ishtirokchilar uchun.",
    keywords: ["matematika", "typing", "musobaqa", "Farg'ona", "Robbit Akademiyasi", "olimpiada"],
    openGraph: {
      title: siteContent?.seo?.homeOgTitle ?? "Farg'ona Matematika va Typing Musobaqasi 2026",
      description:
        siteContent?.seo?.homeOgDescription ??
        "Robbit Akademiyasi tomonidan tashkillashtirilgan katta matematika va typing musobaqasi",
      locale: "uz_UZ",
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteContent = STATIC_SITE_CONTENT;

  return (
    <html lang="uz" className={plusJakartaSans.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground antialiased" suppressHydrationWarning>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-electric-blue focus:px-3 focus:py-2 focus:text-background">
          {siteContent?.skipToContentLabel ?? "Asosiy kontentga o'tish"}
        </a>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

