import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { STATIC_SITE_CONTENT } from "@/lib/site-content";
import { AppToaster } from "@/components/shared/AppToaster";

const META_PIXEL_ID = "971671292039781";

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
    icons: {
      icon: [{ url: "/favicon.png?v=20260406b", type: "image/png" }],
      shortcut: ["/favicon.png?v=20260406b"],
      apple: [{ url: "/favicon.png?v=20260406b", type: "image/png" }],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteContent = STATIC_SITE_CONTENT;
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <html lang="uz" className={plusJakartaSans.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground antialiased" suppressHydrationWarning>
        {isProduction ? (
          <>
            <Script id="meta-pixel-init" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        ) : null}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-electric-blue focus:px-3 focus:py-2 focus:text-background">
          {siteContent?.skipToContentLabel ?? "Asosiy kontentga o'tish"}
        </a>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}

