"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import brandLogo from "@/assets/logo/logo.png";
import { LogInIcon, MenuIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteContent, SiteSettings } from "@/lib/site-content";

const DEFAULT_NAV_LINKS = [
  { href: "#about", label: "Ma'lumot" },
  { href: "#nominations", label: "Yo'nalishlar" },
  { href: "#timeline", label: "Taqvim" },
  { href: "#requirements", label: "Shartlar" },
  { href: "#faq", label: "FAQ" },
];

interface NavbarProps {
  settings?: SiteSettings;
  content?: SiteContent;
}

export function Navbar({ settings, content }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileClosing, setMobileClosing] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (!mobileOpen && !mobileClosing) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setMobileClosing(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen, mobileClosing]);

  const openMobileDrawer = (event?: { stopPropagation: () => void }) => {
    event?.stopPropagation();
    setMobileClosing(true);
    window.setTimeout(() => {
      setMobileOpen(true);
      setMobileClosing(false);
    }, 10);
  };

  const closeMobileDrawer = () => {
    setMobileOpen(false);
    setMobileClosing(true);
    window.setTimeout(() => setMobileClosing(false), 280);
  };

  const logoSrc = settings?.logoUrl ?? brandLogo;
  const siteName = settings?.siteName ?? "Robbit Akademiyasi";
  const navLinks = content?.navbarLinks?.length ? content.navbarLinks : DEFAULT_NAV_LINKS;
  const shouldRenderDrawer = mobileOpen || mobileClosing;
  const mobileDrawer =
    typeof document !== "undefined" && shouldRenderDrawer
      ? createPortal(
          <div className="fixed inset-0 z-[90] md:hidden">
            <button
              type="button"
              aria-label="Close menu backdrop"
              className={cn(
                "absolute inset-0 bg-slate-900/36 backdrop-blur-[10px] transition-opacity duration-300 ease-out",
                mobileOpen ? "opacity-100" : "opacity-0"
              )}
              onClick={closeMobileDrawer}
            />

            <aside
              id="mobile-nav"
              className={cn(
                "absolute bottom-0 right-0 top-0 flex w-[86vw] max-w-[390px] flex-col border-l border-border/70 bg-white/94 shadow-[-12px_0_38px_rgba(17,24,39,0.16)] backdrop-blur-xl transition-transform duration-300 ease-out supports-[backdrop-filter]:bg-white/88",
                mobileOpen ? "translate-x-0" : "translate-x-full"
              )}
              aria-label="Mobil navigatsiya paneli"
            >
              <div className="flex h-20 items-center justify-between border-b border-border/70 bg-[radial-gradient(ellipse_120%_120%_at_0%_0%,rgba(61,129,247,0.16),transparent)] px-5">
                <Link
                  href="/"
                  onClick={(event) => {
                    event.preventDefault();
                    closeMobileDrawer();
                    window.location.assign("/");
                  }}
                  className="inline-flex items-center"
                >
                  <Image
                    src={logoSrc}
                    alt={siteName}
                    width={118}
                    height={36}
                    className="object-contain"
                    unoptimized={typeof logoSrc === "string" && logoSrc.endsWith(".svg")}
                  />
                </Link>
                <button
                  type="button"
                  className="touch-manipulation rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
                  onClick={closeMobileDrawer}
                  aria-label="Close menu"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto bg-transparent px-5 py-5" aria-label="Mobil navigatsiya">
                {navLinks.map(({ href, label }) => (
                  <a
                    key={`${href}-${label}-mobile`}
                    href={href}
                    className="rounded-lg px-3 py-3 text-[1.08rem] font-medium text-muted-foreground transition-colors duration-300 hover:bg-muted/40 hover:text-foreground"
                    onClick={closeMobileDrawer}
                  >
                    {label}
                  </a>
                ))}
                <Link
                  href="/profile"
                  onClick={closeMobileDrawer}
                  className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#3D81F7_0%,#4A9CFA_100%)] px-5 text-[1.05rem] font-semibold text-white transition-[filter] duration-300 hover:brightness-95"
                >
                  <LogInIcon className="h-4 w-4" />
                  Kabinetga kirish
                </Link>
              </nav>
            </aside>
          </div>,
          document.body
        )
      : null;

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 border-b border-transparent",
        "transition-[background-color,border-color,box-shadow] duration-500",
        scrolled
          ? "border-border bg-white/78 shadow-[0_8px_30px_rgba(17,24,39,0.05)] backdrop-blur-[6px]"
          : "border-white/30 bg-white/10 backdrop-blur-[8px] supports-[backdrop-filter]:bg-white/5 md:bg-transparent md:backdrop-blur-0"
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src={logoSrc}
              alt={siteName}
              width={130}
              height={38}
              className="object-contain"
              priority
              unoptimized={typeof logoSrc === "string" && logoSrc.endsWith(".svg")}
            />
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Asosiy navigatsiya">
            {navLinks.map(({ href, label }) => (
              <a
                key={`${href}-${label}`}
                href={href}
                className="text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue/50"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="hidden h-11 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#3D81F7_0%,#4A9CFA_100%)] px-6 text-base font-semibold text-white transition-[filter] duration-200 hover:brightness-95 sm:inline-flex"
            >
              <LogInIcon className="h-4 w-4" />
              Kabinetga kirish
            </Link>

            <button
              className="touch-manipulation p-2 text-muted-foreground transition-colors duration-300 hover:text-foreground md:hidden"
              onClick={(event) => (mobileOpen ? closeMobileDrawer() : openMobileDrawer(event))}
              aria-label="Menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileDrawer}
    </header>
  );
}

