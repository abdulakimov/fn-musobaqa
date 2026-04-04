import { Navbar } from "@/components/sections/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { NominationsSection } from "@/components/sections/NominationsSection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import { RequirementsSection } from "@/components/sections/RequirementsSection";
import { RegistrationCtaSection } from "@/components/sections/RegistrationCtaSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { FooterSection } from "@/components/sections/FooterSection";
import { SectionMotion } from "@/components/shared/SectionMotion";
import {
  STATIC_ABOUT,
  STATIC_CTA,
  STATIC_FAQ_ITEMS,
  STATIC_FAQ_META,
  STATIC_HERO,
  STATIC_NOMINATIONS,
  STATIC_REQUIREMENTS,
  STATIC_SITE_CONTENT,
  STATIC_SITE_SETTINGS,
  STATIC_TIMELINE_EVENTS,
  STATIC_TIMELINE_META,
} from "@/lib/site-content";

export default function HomePage() {
  return (
    <>
      <Navbar settings={STATIC_SITE_SETTINGS} content={STATIC_SITE_CONTENT} />
      <main id="main-content" tabIndex={-1}>
        <SectionMotion preset="fadeIn">
          <HeroSection data={STATIC_HERO} content={STATIC_SITE_CONTENT} />
        </SectionMotion>
        <SectionMotion preset="fadeUp" delay={0.04}>
          <AboutSection data={STATIC_ABOUT} />
        </SectionMotion>
        <SectionMotion preset="fadeUp" delay={0.06}>
          <NominationsSection data={STATIC_NOMINATIONS} content={STATIC_SITE_CONTENT} />
        </SectionMotion>
        <SectionMotion preset="fadeUp" delay={0.08}>
          <TimelineSection events={STATIC_TIMELINE_EVENTS} meta={STATIC_TIMELINE_META} content={STATIC_SITE_CONTENT} />
        </SectionMotion>
        <SectionMotion preset="fadeUp" delay={0.1}>
          <RequirementsSection data={STATIC_REQUIREMENTS} />
        </SectionMotion>
        <SectionMotion preset="scaleIn" delay={0.12}>
          <RegistrationCtaSection data={STATIC_CTA} />
        </SectionMotion>
        <SectionMotion preset="fadeUp" delay={0.14}>
          <FaqSection items={STATIC_FAQ_ITEMS} meta={STATIC_FAQ_META} />
        </SectionMotion>
      </main>
      <FooterSection settings={STATIC_SITE_SETTINGS} content={STATIC_SITE_CONTENT} />
    </>
  );
}
