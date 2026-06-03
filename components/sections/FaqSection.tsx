"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionWrapper, SectionHeader } from "@/components/shared/SectionWrapper";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { MotionCard } from "@/components/shared/MotionCard";
import type { FaqItem, SectionMeta } from "@/lib/site-content";

const DEFAULT_FAQS: FaqItem[] = [
  {
    _id: "5",
    question: "Natijalar qanday e'lon qilinadi?",
    answer: "Natijalar profilda emas, rasmiy",
    linkText: "Telegram kanalida",
    linkHref: "https://t.me/robbituz",
    answerSuffix: "e'lon qilinadi.",
    order: 1,
  },
  {
    _id: "6",
    question: "Robbit akademiyasi qanday markaz?",
    answer:
      "Robbit akademiyasi 6-15 yosh o'quvchilar uchun robototexnika va IT yo'nalishlarida amaliy darslar beradigan zamonaviy o'quv markazi.",
    order: 2,
  },
  {
    _id: "7",
    question: "Musobaqa nizomini qayerdan olaman?",
    answer: "Musobaqa nizomini",
    linkText: "shaxsiy kabinetingizdan",
    linkHref: "/profile/login",
    answerSuffix: "olishingiz mumkin.",
    order: 3,
  },
  {
    _id: "8",
    question: "Natijalar profilda ko'rinadimi?",
    answer: "Yo'q, barcha yakuniy natijalar rasmiy",
    linkText: "Telegram kanalida",
    linkHref: "https://t.me/robbituz",
    answerSuffix: "e'lon qilinadi.",
    order: 4,
  },
];

interface FaqSectionProps {
  items: FaqItem[];
  meta?: SectionMeta | null;
}

export function FaqSection({ items, meta }: FaqSectionProps) {
  const faqs = items.length > 0 ? items : DEFAULT_FAQS;

  return (
    <SectionWrapper id="faq" className="bg-muted/20">
      <SectionHeader
        tag={meta?.sectionTag ?? "Ko'p so'raladigan savollar"}
        title={meta?.sectionTitle ?? "Savollaringiz bormi?"}
        subtitle={meta?.sectionSubtitle ?? "Musobaqa haqida eng ko'p so'raladigan savollarga javoblar"}
      />

      <div className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <ScrollReveal key={faq._id} preset="fadeUp" staggerIndex={i} mobilePreset="fadeIn">
              <MotionCard>
                <AccordionItem
                  value={faq._id}
                  className="ui-surface px-6 transition-colors data-[state=open]:border-electric-blue/30"
                >
                  <AccordionTrigger className="py-5 text-left font-display text-[1.06rem] font-semibold leading-7 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="border-t border-border/70 pb-5 pt-4 text-[1.02rem] leading-8 text-muted-foreground">
                    {faq.linkHref && faq.linkText ? (
                      <span>
                        {faq.answer}{" "}
                        {faq.linkHref.startsWith("http") ? (
                          <a
                            href={faq.linkHref}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-electric-blue underline underline-offset-2 hover:text-[#2F73EA]"
                          >
                            {faq.linkText}
                          </a>
                        ) : (
                          <Link href={faq.linkHref} className="font-medium text-electric-blue underline underline-offset-2 hover:text-[#2F73EA]">
                            {faq.linkText}
                          </Link>
                        )}{" "}
                        {faq.answerSuffix ?? ""}
                      </span>
                    ) : (
                      faq.answer
                    )}
                  </AccordionContent>
                </AccordionItem>
              </MotionCard>
            </ScrollReveal>
          ))}
        </Accordion>
      </div>
    </SectionWrapper>
  );
}
