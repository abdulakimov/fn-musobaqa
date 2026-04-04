import { z } from "zod";
import { normalizeUzPhone } from "@/lib/phone";

const NAME_REGEX = /^[A-Za-z'`\-\s]+$/;

export function normalizePhone(input: string) {
  return normalizeUzPhone(input);
}

export const step1Schema = z.object({
  ism: z
    .string()
    .trim()
    .min(2, "Ism kamida 2 harf bo'lishi kerak")
    .max(80, "Ism juda uzun")
    .regex(NAME_REGEX, "Ismda faqat harf va belgilar bo'lishi kerak"),
  familiya: z
    .string()
    .trim()
    .min(2, "Familiya kamida 2 harf bo'lishi kerak")
    .max(80, "Familiya juda uzun")
    .regex(NAME_REGEX, "Familiyada faqat harf va belgilar bo'lishi kerak"),
  otasiningIsmi: z
    .string()
    .trim()
    .min(2, "Otasining ismi kamida 2 harf bo'lishi kerak")
    .max(80, "Otasining ismi juda uzun")
    .regex(NAME_REGEX, "Otasining ismida faqat harf va belgilar bo'lishi kerak"),
  telefon: z
    .string()
    .transform((value) => normalizePhone(value))
    .refine((value) => /^\+998\d{9}$/.test(value), "Telefon +998XXXXXXXXX formatida bo'lishi kerak"),
  yonalish: z.enum(["MATEMATIKA", "TYPING"] as const, {
    message: "Yo'nalishni tanlang",
  }),
  yoshGuruhi: z
    .enum(["YOSH_9_11", "YOSH_12_14", "YOSH_9_14"] as const)
    .refine((v) => !!v, { message: "Yosh guruhini tanlang" }),
}).superRefine((data, ctx) => {
  if (data.yonalish === "TYPING" && data.yoshGuruhi !== "YOSH_9_14") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["yoshGuruhi"],
      message: "Typing yo'nalishi uchun yosh guruhi 9-14 bo'lishi kerak",
    });
  }

  if (
    data.yonalish === "MATEMATIKA" &&
    !["YOSH_9_11", "YOSH_12_14"].includes(data.yoshGuruhi)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["yoshGuruhi"],
      message: "Matematika yo'nalishi uchun 9-11 yoki 12-14 yosh guruhini tanlang",
    });
  }
});

export const fullRegistrationSchema = step1Schema.strict();

export type Step1Data = z.infer<typeof step1Schema>;
export type FullRegistrationData = z.infer<typeof fullRegistrationSchema>;

export const YOSH_GURUH_LABELS: Record<string, string> = {
  YOSH_9_11: "9-11 yosh",
  YOSH_12_14: "12-14 yosh",
  YOSH_9_14: "9-14 yosh",
};

export const YONALISH_LABELS: Record<string, string> = {
  MATEMATIKA: "Matematika",
  TYPING: "Typing",
};
