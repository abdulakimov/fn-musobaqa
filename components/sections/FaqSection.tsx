"use client";

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
    _id: "1",
    question: "Qaysi yo'nalishni tanlash mumkin?",
    answer:
      "Ro'yxatdan o'tishda Matematika yoki Typing yo'nalishidan birini tanlaysiz. Har bir yo'nalish bo'yicha alohida baholash olib boriladi.",
    order: 1,
  },
  {
    _id: "2",
    question: "Musobaqa pullikmi?",
    answer: "Yo'q, musobaqada qatnashish va ro'yxatdan o'tish mutlaqo bepul.",
    order: 2,
  },
  {
    _id: "3",
    question: "Yosh chegarasi qanday?",
    answer:
      "Matematika yo'nalishi uchun 9-11 va 12-14 yosh toifalari qabul qilinadi. Typing yo'nalishi uchun esa umumiy 9-14 yosh toifasi qabul qilinadi.",
    order: 3,
  },
  {
    _id: "4",
    question: "Natijalar qanday e'lon qilinadi?",
    answer:
      "Natijalar 19-aprel kuni e'lon qilinadi va rasmiy kanallar orqali ham yuboriladi.",
    order: 4,
  },
  {
    _id: "5",
    question: "Robbit akademiyasi qanday markaz?",
    answer:
      "Robbit akademiyasi 6-15 yosh o'quvchilar uchun robototexnika va IT yo'nalishlarida amaliy darslar beradigan zamonaviy o'quv markazi.",
    order: 5,
  },
  {
    _id: "6",
    question: "Typing yo'nalishida nimalar baholanadi?",
    answer:
      "Asosiy mezonlar: tezlik (WPM), aniqlik va xatolar soni.",
    order: 6,
  },
  {
    _id: "7",
    question: "Matematika yo'nalishida kalkulyator ruxsat etiladimi?",
    answer:
      "Yo'q, masalalar kalkulyatorsiz yechish formatida bo'ladi.",
    order: 7,
  },
  {
    _id: "8",
    question: "Sovrinlar qanday?",
    answer:
      "1-3 o'rinlar uchun sovrinlar beriladi, barcha ishtirokchilarga sertifikat topshiriladi.",
    order: 8,
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
                    {faq.answer}
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

