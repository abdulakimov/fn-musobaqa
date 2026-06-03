"use client";

import { useCallback, useState } from "react";
import { appToast as toast } from "@/lib/toast";
import {
  type FullRegistrationData,
  YONALISH_LABELS,
  YOSH_GURUH_LABELS,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CheckCircle2Icon,
  Loader2Icon,
} from "lucide-react";
import type { RegisterFormContent } from "@/lib/site-content";
import { STATIC_SITE_SETTINGS } from "@/lib/site-content";
import { VisitInfoDialog } from "@/components/forms/VisitInfoDialog";

interface Props {
  data: FullRegistrationData;
  onBack: () => void;
  content?: RegisterFormContent;
}

type LimitSuggestion = {
  yonalish: FullRegistrationData["yonalish"];
  yoshGuruhi: FullRegistrationData["yoshGuruhi"];
  label: string;
  remainingSlots: number;
};

type LimitReachedResponse = {
  code: "LIMIT_REACHED_TYPING" | "LIMIT_REACHED_MATH_9_11" | "LIMIT_REACHED_MATH_12_14";
  error?: string;
  suggestions?: LimitSuggestion[];
};

type RegistrationClosedResponse = {
  code: "REGISTRATION_CLOSED";
  error?: string;
};

type AvailabilityBannerState = {
  title: string;
  message: string;
  suggestions: LimitSuggestion[];
  showTypingExtensionNotice: boolean;
};

const TYPING_EXTENSION_NOTICE = "Faqat Typing yo'nalishi uchun ro'yxatdan o'tish 17-aprel, 18:00 (Asia/Tashkent) gacha ochiq.";

function getFirstFieldError(errors: unknown) {
  if (!errors || typeof errors !== "object") return null;
  const fieldErrors = (errors as { fieldErrors?: Record<string, unknown> }).fieldErrors;
  if (!fieldErrors || typeof fieldErrors !== "object") return null;

  for (const value of Object.values(fieldErrors)) {
    if (Array.isArray(value)) {
      const firstMessage = value.find((item) => typeof item === "string");
      if (typeof firstMessage === "string" && firstMessage.trim()) {
        return firstMessage;
      }
    }
  }

  return null;
}

export function Step4Confirm({ data, onBack, content }: Props) {
  const common = content?.common;
  const step4 = content?.step4;
  const telegramUrl = STATIC_SITE_SETTINGS.telegram ?? "https://t.me/robbituz";
  const fieldLabels: Array<{
    key: keyof FullRegistrationData;
    label: string;
    format?: (v: unknown) => string;
  }> = [
    { key: "ism", label: step4?.firstNameLabel ?? "Ism" },
    { key: "familiya", label: step4?.lastNameLabel ?? "Familiya" },
    { key: "otasiningIsmi", label: step4?.middleNameLabel ?? "Otasining ismi" },
    { key: "telefon", label: step4?.phoneLabel ?? "Telefon" },
    {
      key: "yonalish",
      label: step4?.directionLabel ?? "Yo'nalish",
      format: (v) => YONALISH_LABELS[v as string] ?? String(v),
    },
    {
      key: "yoshGuruhi",
      label: step4?.ageGroupLabel ?? "Yosh guruhi",
      format: (v) => YOSH_GURUH_LABELS[v as string] ?? String(v),
    },
  ];

  const [loading, setLoading] = useState(false);
  const [visitInfo, setVisitInfo] = useState<{
    participantId: string;
    visitText: string;
    directionLabel: string;
    warning: string;
  } | null>(null);
  const [bannerState, setBannerState] = useState<AvailabilityBannerState | null>(null);

  const handleVisitDone = useCallback(() => {
    if (!visitInfo) return;
    toast.success("Ro'yxatdan o'tdingiz");
    setVisitInfo(null);
    window.location.assign(telegramUrl);
  }, [telegramUrl, visitInfo]);

  const handleSubmit = async () => {
    setLoading(true);
    setBannerState(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (res.ok) {
        const participantId = String(json.participantId ?? "").toUpperCase();
        if (!participantId) {
          toast.error("ID generatsiyasida xatolik yuz berdi");
          return;
        }
        setBannerState(null);
        setVisitInfo({
          participantId,
          visitText: String(json?.visit?.displayText ?? "Tashrif vaqti aniqlanmadi"),
          directionLabel: YONALISH_LABELS[data.yonalish] ?? String(data.yonalish),
          warning: String(json?.warning ?? "Belgilangan vaqtda kelmasangiz, qayta qo'shish imkoni bo'lmaydi."),
        });
      } else if (res.status === 409) {
        toast.error("Bu telefon raqam allaqachon ro'yxatdan o'tgan");
      } else if (res.status === 403 && json?.code === "REGISTRATION_CLOSED") {
        const closedJson = json as RegistrationClosedResponse;
        const showTypingExtensionNotice = data.yonalish === "MATEMATIKA";
        setBannerState({
          title: "Ro'yxatdan o'tish yopildi",
          message: closedJson.error ?? "Ro'yxatdan o'tish yopilgan.",
          suggestions: [],
          showTypingExtensionNotice,
        });
      } else if (
        res.status === 403 &&
        (json?.code === "LIMIT_REACHED_TYPING" ||
          json?.code === "LIMIT_REACHED_MATH_9_11" ||
          json?.code === "LIMIT_REACHED_MATH_12_14")
      ) {
        const limitJson = json as LimitReachedResponse;
        setBannerState({
          title: "Joylar to'ldi",
          message: limitJson.error ?? "Ushbu yo'nalish/yosh toifasi uchun ro'yxatdan o'tish yakunlangan.",
          suggestions: Array.isArray(limitJson.suggestions) ? limitJson.suggestions : [],
          showTypingExtensionNotice:
            data.yonalish === "MATEMATIKA" &&
            (limitJson.code === "LIMIT_REACHED_MATH_9_11" || limitJson.code === "LIMIT_REACHED_MATH_12_14"),
        });
      } else if (res.status === 422) {
        const firstFieldError = getFirstFieldError(json?.errors);
        toast.error(firstFieldError ?? json?.error ?? "Ma'lumotlarda xatolik bor. Iltimos tekshirib qayta yuboring.");
      } else {
        toast.error(json.error ?? "Xatolik yuz berdi, qayta urinib ko'ring");
      }
    } catch {
      toast.error("Tarmoq xatosi. Internet aloqangizni tekshiring");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {bannerState ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-destructive/35 bg-destructive/5 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 rounded-full bg-destructive/10 p-2 text-destructive">
                  <AlertTriangleIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1 space-y-3">
                  <p className="text-base font-semibold text-destructive">{bannerState.title}</p>
                  <p className="mt-1 text-sm text-foreground/90">{bannerState.message}</p>
                  {bannerState.showTypingExtensionNotice ? (
                    <p className="rounded-xl border border-[#8BC5FF] bg-[#EAF4FF] px-3 py-2 text-xs font-medium text-[#175B9A]">
                      {TYPING_EXTENSION_NOTICE}
                    </p>
                  ) : null}
                  {bannerState.suggestions.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Tavsiya etilgan variantlar</p>
                      <div className="space-y-2">
                        {bannerState.suggestions.slice(0, 2).map((suggestion) => (
                          <div
                            key={`${suggestion.yonalish}-${suggestion.yoshGuruhi}`}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-left text-sm"
                          >
                            <span className="font-medium text-foreground">{suggestion.label}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({suggestion.remainingSlots} ta joy qoldi)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <Button
              type="button"
              onClick={onBack}
              className="h-12 w-full rounded-full bg-electric-blue text-base font-semibold text-background hover:bg-electric-blue/90"
            >
              Qaytadan ro&apos;yxatdan o&apos;tish
            </Button>
          </div>
        ) : (
          <>
            <div>
              <h3 className="mb-1 font-display text-lg font-semibold">
                {step4?.title ?? "Ma'lumotlarni tasdiqlang"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step4?.subtitle ?? "Yuborishdan oldin ma'lumotlarni tekshiring"}
              </p>
            </div>

            <div className="divide-y divide-border rounded-xl border border-border bg-muted/30">
              {fieldLabels
                .filter((f) => data[f.key] !== undefined && data[f.key] !== "" && data[f.key] !== null)
                .map(({ key, label, format }) => (
                  <div key={key} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-right font-medium">{format ? format(data[key]) : String(data[key])}</span>
                  </div>
                ))}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="h-12 flex-1 gap-2 rounded-full"
                disabled={loading}
              >
                <ArrowLeftIcon className="h-4 w-4" />
                {common?.backText ?? content?.backText ?? "Orqaga"}
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="glow-blue h-12 flex-1 gap-2 rounded-full bg-electric-blue text-base font-semibold text-background hover:bg-electric-blue/90"
              >
                {loading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <CheckCircle2Icon className="h-4 w-4" />}
                {loading
                  ? (common?.submitLoadingText ?? "Yuborilmoqda...")
                  : (common?.submitText ?? content?.submitText ?? "Yuborish")}
              </Button>
            </div>
          </>
        )}
      </div>
      {visitInfo ? (
        <VisitInfoDialog
          participantId={visitInfo.participantId}
          visitText={visitInfo.visitText}
          directionLabel={visitInfo.directionLabel}
          warning={visitInfo.warning}
          address={STATIC_SITE_SETTINGS.address ?? "Farg'ona viloyati, Fag'ona shahri, Najot Ta'lim binosi"}
          mapUrl={STATIC_SITE_SETTINGS.mapUrl ?? "https://yandex.uz/maps/-/CPfhBImd"}
          telegramUrl={telegramUrl}
          onDone={handleVisitDone}
        />
      ) : null}
    </>
  );
}

