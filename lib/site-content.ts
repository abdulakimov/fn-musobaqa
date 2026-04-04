export interface SiteSettings {
  siteName?: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  telegram?: string;
  instagram?: string;
  youtube?: string;
}

export interface LinkItem {
  label: string;
  href: string;
}

export interface SeoContent {
  homeTitle?: string;
  homeDescription?: string;
  homeOgTitle?: string;
  homeOgDescription?: string;
  registerTitle?: string;
  registerDescription?: string;
}

export interface RegisterPageContent {
  backLinkText?: string;
  tagText?: string;
  title?: string;
  subtitle?: string;
  helpText?: string;
  helpPrefixText?: string;
  helpPhone?: string;
  helpCallToActionText?: string;
  helpTelegramUrl?: string;
  helpTelegramText?: string;
  helpSuffixText?: string;
}

export interface RegisterFormAgeOption {
  value: string;
  label: string;
}

export interface RegisterFormDirectionOption {
  value: string;
  label: string;
}

export interface RegisterFormCommonContent {
  nextText?: string;
  backText?: string;
  confirmText?: string;
  submitText?: string;
  submitLoadingText?: string;
  viewText?: string;
  yesText?: string;
  noText?: string;
}

export interface RegisterFormStep1Content {
  firstNameLabel?: string;
  firstNamePlaceholder?: string;
  lastNameLabel?: string;
  lastNamePlaceholder?: string;
  middleNameLabel?: string;
  middleNamePlaceholder?: string;
  phoneLabel?: string;
  phonePlaceholder?: string;
  directionLabel?: string;
  directionPlaceholder?: string;
  directionOptions?: RegisterFormDirectionOption[];
  ageGroupLabel?: string;
  ageGroupPlaceholder?: string;
  ageGroupOptions?: RegisterFormAgeOption[];
}

export interface RegisterFormStep4Content {
  title?: string;
  subtitle?: string;
  successTitle?: string;
  successDescription?: string;
  successBackHomeText?: string;
  summaryNameLabel?: string;
  summaryPhoneLabel?: string;
  summaryDirectionLabel?: string;
  summaryAgeGroupLabel?: string;
  firstNameLabel?: string;
  lastNameLabel?: string;
  middleNameLabel?: string;
  phoneLabel?: string;
  directionLabel?: string;
  ageGroupLabel?: string;
}

export interface RegisterFormContent {
  stepLabels?: string[];
  common?: RegisterFormCommonContent;
  step1?: RegisterFormStep1Content;
  step4?: RegisterFormStep4Content;
  nextText?: string;
  backText?: string;
  confirmText?: string;
  submitText?: string;
}

export interface SiteContent {
  seo?: SeoContent;
  skipToContentLabel?: string;
  heroCountdownLabel?: string;
  heroScrollLabel?: string;
  nominationsTasksLabel?: string;
  timelineDateLocale?: string;
  navbarLinks?: LinkItem[];
  registerButtonText?: string;
  footerDescription?: string;
  footerQuickLinksTitle?: string;
  footerQuickLinks?: LinkItem[];
  footerContactTitle?: string;
  footerCopyrightText?: string;
  footerEventText?: string;
  registerPage?: RegisterPageContent;
  registerForm?: RegisterFormContent;
}

export interface HeroContent {
  tagText?: string;
  title?: string;
  subtitle?: string;
  competitionDate?: string;
  registrationDeadline?: string;
  ctaText?: string;
  ctaSecondaryText?: string;
  locationText?: string;
}

export type IconKey =
  | "math"
  | "typing"
  | "analytics"
  | "award"
  | "certificate"
  | "gift"
  | "camera"
  | "community"
  | "growth";

export interface AboutFeature {
  iconKey: IconKey;
  title: string;
  desc: string;
}

export interface AboutContent {
  sectionTag?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  description?: string;
  stats?: Array<{ label: string; value: number; suffix?: string }>;
  features?: AboutFeature[];
}

export interface Nomination {
  ageGroup: string;
  title: string;
  iconKey: IconKey;
  badge: string;
  description: string;
  tasks: string[];
  colorAccent: "blue" | "green" | "orange";
}

export interface NominationsSectionContent {
  sectionTag?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  tasksTitle?: string;
  nominations?: Nomination[];
}

export interface RequirementItem {
  text: string;
  required: boolean;
}

export interface BenefitItem {
  iconKey: IconKey;
  text: string;
}

export interface RequirementsSectionContent {
  sectionTag?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  requirementsTitle?: string;
  requirements?: RequirementItem[];
  benefitsTitle?: string;
  benefits?: BenefitItem[];
  optionalPrefix?: string;
}

export interface CtaSectionContent {
  sectionTag?: string;
  title?: string;
  subtitle?: string;
  deadline?: string;
  deadlinePrefixText?: string;
  deadlineSuffixText?: string;
  ctaText?: string;
  note?: string;
}

export interface SectionMeta {
  sectionTag?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
}

export interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  order: number;
}

export interface TimelineEvent {
  _id: string;
  title: string;
  date: string;
  description?: string;
  status: "upcoming" | "current" | "completed";
  order: number;
}

export const STATIC_SITE_SETTINGS: SiteSettings = {
  siteName: "Robbit Akademiyasi",
  phone: "78-777-3-777",
  email: "info@robbit.uz",
  website: "robbit.uz",
  address: "Farg'ona viloyati, Farg'ona shahri",
  telegram: "https://t.me/robbituz",
  instagram: "https://www.instagram.com/robbituz/",
  youtube: "https://www.youtube.com/@Robbituz",
};

export const STATIC_SITE_CONTENT: SiteContent = {
  seo: {
    homeTitle: "Farg'ona Matematika va Typing Musobaqasi 2026 | Robbit Akademiyasi",
    homeDescription:
      "Robbit Akademiyasi tomonidan tashkillashtirilgan Farg'ona Matematika va Typing musobaqasiga hoziroq ro'yxatdan o'ting. 9-11 va 12-14 yosh ishtirokchilar uchun.",
    homeOgTitle: "Farg'ona Matematika va Typing Musobaqasi 2026",
    homeOgDescription: "Matematika va typing bo'yicha katta mintaqaviy musobaqa",
    registerTitle: "Ro'yxatdan o'tish | Matematika va Typing Musobaqasi 2026",
    registerDescription:
      "Farg'ona Matematika va Typing musobaqasiga ro'yxatdan o'ting. 18-19-aprel 2026.",
  },
  skipToContentLabel: "Asosiy kontentga o'tish",
  heroCountdownLabel: "Musobaqagacha qolgan vaqt",
  heroScrollLabel: "Pastga",
  nominationsTasksLabel: "Sinov bloklari",
  timelineDateLocale: "uz-UZ",
  navbarLinks: [
    { label: "Ma'lumot", href: "#about" },
    { label: "Yo'nalishlar", href: "#nominations" },
    { label: "Taqvim", href: "#timeline" },
    { label: "Shartlar", href: "#requirements" },
    { label: "FAQ", href: "#faq" },
  ],
  registerButtonText: "Ro'yxatdan o'tish",
  footerDescription:
    "Robbit akademiyasi 6 yoshdan 15 yoshgacha bo'lgan bolalarga Robototexnika va IT bo'yicha dars beradigan o'quv markazi.",
  footerQuickLinksTitle: "Tezkor havolalar",
  footerQuickLinks: [
    { label: "Musobaqa haqida", href: "#about" },
    { label: "Yo'nalishlar", href: "#nominations" },
    { label: "Taqvim", href: "#timeline" },
    { label: "Shartlar", href: "#requirements" },
    { label: "FAQ", href: "#faq" },
    { label: "Ro'yxatdan o'tish", href: "/register" },
  ],
  footerContactTitle: "Bog'lanish",
  footerCopyrightText: "© 2026 Robbit Akademiyasi. Barcha huquqlar himoyalangan.",
  footerEventText: "Farg'ona Matematika va Typing musobaqasi - 18-19-aprel 2026",
  registerPage: {
    backLinkText: "Bosh sahifaga qaytish",
    tagText: "Ro'yxatdan o'tish",
    title: "Musobaqaga kirish",
    subtitle: "18-19-aprel 2026 | Farg'ona viloyati",
    helpPrefixText: "Savolingiz bormi?",
    helpPhone: "78-777-3-777",
    helpCallToActionText: "ga qo'ng'iroq qiling yoki",
    helpTelegramUrl: "https://t.me/robbituz",
    helpTelegramText: "Telegram",
    helpSuffixText: "ga yozing.",
  },
  registerForm: {
    stepLabels: ["Shaxsiy", "Tasdiqlash"],
    common: {
      nextText: "Davom etish",
      backText: "Orqaga",
      confirmText: "Tasdiqlash",
      submitText: "Yuborish",
      submitLoadingText: "Yuborilmoqda...",
      viewText: "Ko'rish",
      yesText: "Ha",
      noText: "Yo'q",
    },
    step1: {
      firstNameLabel: "Ism",
      firstNamePlaceholder: "Abdulloh",
      lastNameLabel: "Familiya",
      lastNamePlaceholder: "Karimov",
      middleNameLabel: "Otasining ismi",
      middleNamePlaceholder: "Bahodir o'g'li",
      phoneLabel: "Telefon raqami",
      phonePlaceholder: "+998 91-234-56-73",
      directionLabel: "Yo'nalish",
      directionPlaceholder: "Yo'nalishni tanlang",
      directionOptions: [
        { value: "MATEMATIKA", label: "Matematika" },
        { value: "TYPING", label: "Typing" },
      ],
      ageGroupLabel: "Yosh guruhi",
      ageGroupPlaceholder: "Yosh guruhini tanlang",
      ageGroupOptions: [
        { value: "YOSH_9_11", label: "9-11 yosh" },
        { value: "YOSH_12_14", label: "12-14 yosh" },
      ],
    },
    step4: {
      title: "Ma'lumotlarni tasdiqlang",
      subtitle: "Yuborishdan oldin ma'lumotlarni tekshiring",
      successTitle: "Muvaffaqiyatli ro'yxatdan o'tdingiz!",
      successDescription: "Ariza qabul qilindi. Profilga kirish uchun telefon raqamingiz va ID'ingizdan foydalaning.",
      successBackHomeText: "Bosh sahifaga qaytish",
      summaryNameLabel: "Ism",
      summaryPhoneLabel: "Telefon",
      summaryDirectionLabel: "Yo'nalish",
      summaryAgeGroupLabel: "Yosh guruhi",
      firstNameLabel: "Ism",
      lastNameLabel: "Familiya",
      middleNameLabel: "Otasining ismi",
      phoneLabel: "Telefon",
      directionLabel: "Yo'nalish",
      ageGroupLabel: "Yosh guruhi",
    },
  },
};

export const STATIC_HERO: HeroContent = {
  tagText: "Robbit Akademiyasi taqdim etadi",
  title: "Farg'onada Matematika va Typing Musobaqasi",
  subtitle:
    "Robbit akademiyasi tomonidan yoshlarning analitik fikrlashi va klaviatura tezligini sinovdan o'tkazadigan yirik mintaqaviy musobaqa",
  competitionDate: "2026-04-18T09:00:00+05:00",
  registrationDeadline: "2026-04-17T23:59:59+05:00",
  ctaText: "Ro'yxatdan o'tish",
  ctaSecondaryText: "Batafsil ma'lumot",
  locationText: "Farg'ona viloyati",
};

export const STATIC_ABOUT: AboutContent = {
  sectionTag: "Musobaqa haqida",
  sectionTitle: "Matematika va Typing bo'yicha katta bellashuv",
  sectionSubtitle:
    "Robbit Akademiyasi Farg'ona viloyati bo'yicha o'quvchilar uchun bilim va tezlik musobaqasini tashkillashtirmoqda",
  description:
    "Matematika va typing musobaqasi o'quvchilarning mantiqiy fikrlashi, masala yechish strategiyasi hamda klaviaturada tez va to'g'ri ishlash ko'nikmalarini baholaydi.\n\nMatematika yo'nalishi 9-11 va 12-14 yosh guruhlari uchun alohida o'tkaziladi. Typing yo'nalishi esa umumiy 9-14 yoshlar uchun tashkil etiladi.",
  stats: [
    { label: "Ishtirokchi", value: 1300, suffix: "+" },
    { label: "Sovrin (so'm)", value: 54000000, suffix: "" },
    { label: "Musobaqa qiymati (so'm)", value: 200000000, suffix: "" },
  ],
  features: [
    { iconKey: "math", title: "Matematik fikrlash", desc: "Mantiqiy masalalarni tez va aniq yechish" },
    { iconKey: "typing", title: "Typing tezligi", desc: "Tezlik va xatosiz yozish ko'nikmasi" },
    { iconKey: "analytics", title: "Adolatli baholash", desc: "Natijalar shaffof baholanadi" },
    { iconKey: "award", title: "Sertifikat va sovrin", desc: "G'oliblar uchun sovrinlar, barchaga sertifikat" },
  ],
};

export const STATIC_NOMINATIONS: NominationsSectionContent = {
  sectionTag: "Yo'nalishlar",
  sectionTitle: "2 ta yo'nalish va 2 ta yosh toifasi",
  sectionSubtitle:
    "Har bir ishtirokchi Matematika yoki Typing yo'nalishini tanlaydi va 9-11 yoki 12-14 yosh guruhida qatnashadi",
  tasksTitle: "Bellashuv bloklari",
  nominations: [
    {
      ageGroup: "9-14 yosh",
      title: "Matematika",
      iconKey: "math",
      badge: "Asosiy yo'nalish",
      description: "9-11 va 12-14 yosh guruhlari uchun mantiqiy hamda arifmetik masalalar bo'yicha bellashuv.",
      tasks: ["Arifmetik tezkor test", "Mantiqiy masalalar", "Analitik yechim va aniqlik"],
      colorAccent: "blue",
    },
    {
      ageGroup: "9-14 yosh",
      title: "Typing",
      iconKey: "typing",
      badge: "Tezlik",
      description: "Typing yo'nalishi 9-14 yosh toifasi bo'yicha tezlik va aniqlik mezonida baholanadi.",
      tasks: ["Tezlik sinovi", "Xatolar ko'rsatkichi", "Final natija reytingi"],
      colorAccent: "blue",
    },
  ],
};

export const STATIC_REQUIREMENTS: RequirementsSectionContent = {
  sectionTag: "Shartlar va imtiyozlar",
  sectionTitle: "Kimlar qatnasha oladi?",
  sectionSubtitle: "Musobaqada qatnashish uchun asosiy mezonlar va talablar",
  requirementsTitle: "Talablar",
  benefitsTitle: "Nima olasiz?",
  optionalPrefix: "Majburiy emas",
  requirements: [
    { text: "9-14 yosh toifasiga tushish", required: true },
    { text: "Farg'ona viloyatidan bo'lish", required: true },
    { text: "Typing va matematikaga qiziqish bo'lishi", required: true },
    { text: "Tug'ilganlik haqida hujjat nusxasi", required: true },
    { text: "Ro'yxatdan o'tish formasini to'liq to'ldirish", required: true },
    { text: "Musobaqa kuni belgilangan vaqtda kelish", required: true },
    { text: "2 ta yo'nalishdan faqat 1 tasini tanlash", required: true },
  ],
  benefits: [
    { iconKey: "certificate", text: "Akademiya uchun sertifikat va imtiyozlar" },
    { iconKey: "award", text: "Barcha ishtirokchilarga sertifikat" },
    { iconKey: "gift", text: "Faol ishtirokchilar uchun sovg'alar" },
    { iconKey: "camera", text: "Rasmiy foto va video yorituv" },
    { iconKey: "community", text: "Yoshlar uchun kuchli raqobat muhiti" },
    { iconKey: "growth", text: "Ko'nikmalarni real sinovda baholash" },
  ],
};

export const STATIC_CTA: CtaSectionContent = {
  sectionTag: "O'rinlar cheklangan",
  title: "Hoziroq Ro'yxatdan O'ting!",
  subtitle: "18-19-aprel 2026-yil, Farg'ona viloyatida o'tkaziladi.",
  deadlinePrefixText: "Ro'yxatdan o'tish muddati:",
  deadline: "2026-yil 7-apreldan 17-aprelgacha",
  deadlineSuffixText: "davom etadi.",
  ctaText: "Ro'yxatdan o'tish",
  note: "Bepul ishtirok • Onlayn ariza • Taxminan 3 daqiqa",
};

export const STATIC_FAQ_META: SectionMeta = {
  sectionTag: "Ko'p so'raladigan savollar",
  sectionTitle: "Savollaringiz bormi?",
  sectionSubtitle: "Matematika va Typing musobaqasi haqida asosiy javoblar",
};

export const STATIC_FAQ_ITEMS: FaqItem[] = [
  {
    _id: "faqItem-1",
    question: "Qaysi yo'nalishni tanlash mumkin?",
    answer:
      "Ro'yxatdan o'tishda Matematika yoki Typing yo'nalishidan birini tanlaysiz. Har bir yo'nalish bo'yicha alohida baholash olib boriladi.",
    order: 1,
  },
  {
    _id: "faqItem-2",
    question: "Musobaqa pullikmi?",
    answer: "Yo'q, musobaqada qatnashish va ro'yxatdan o'tish mutlaqo bepul.",
    order: 2,
  },
  {
    _id: "faqItem-3",
    question: "Yosh chegarasi qanday?",
    answer:
      "Matematika yo'nalishi uchun 9-11 va 12-14 yosh toifalari qabul qilinadi. Typing yo'nalishi uchun esa umumiy 9-14 yosh toifasi qabul qilinadi.",
    order: 3,
  },
  {
    _id: "faqItem-4",
    question: "Natijalar qanday e'lon qilinadi?",
    answer: "Natijalar 19-aprel kuni e'lon qilinadi va rasmiy kanallar orqali ham yuboriladi.",
    order: 4,
  },
  {
    _id: "faqItem-5",
    question: "Robbit akademiyasi qanday markaz?",
    answer:
      "Robbit akademiyasi 6-15 yosh o'quvchilar uchun robototexnika va IT yo'nalishlarida amaliy darslar beradigan zamonaviy o'quv markazi.",
    order: 5,
  },
];

export const STATIC_TIMELINE_META: SectionMeta = {
  sectionTag: "Taqvim",
  sectionTitle: "Muhim sanalar",
  sectionSubtitle: "Musobaqa jarayonidagi asosiy bosqichlar",
};

export const STATIC_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    _id: "timelineEvent-1",
    title: "Ro'yxatdan o'tish boshlandi",
    date: "2026-04-07",
    description: "Musobaqa uchun onlayn ro'yxatdan o'tish ochiladi.",
    status: "completed",
    order: 1,
  },
  {
    _id: "timelineEvent-2",
    title: "Ro'yxatdan o'tish yakunlanadi",
    date: "2026-04-17",
    description: "Arizalarni qabul qilishning so'nggi kuni.",
    status: "upcoming",
    order: 2,
  },
  {
    _id: "timelineEvent-3",
    title: "Matematika musobaqasi",
    date: "2026-04-18",
    description: "Matematika yo'nalishi bo'yicha 9-11 va 12-14 yosh guruhlari bellashuvi o'tkaziladi.",
    status: "upcoming",
    order: 3,
  },
  {
    _id: "timelineEvent-4",
    title: "Typing musobaqasi",
    date: "2026-04-19",
    description: "Typing yo'nalishi bo'yicha 9-14 yosh toifasi bellashuvi o'tkaziladi.",
    status: "upcoming",
    order: 4,
  },
  {
    _id: "timelineEvent-5",
    title: "Natijalar e'loni",
    date: "2026-04-19",
    description: "Yakuniy natijalar e'lon qilinadi.",
    status: "upcoming",
    order: 5,
  },
];


