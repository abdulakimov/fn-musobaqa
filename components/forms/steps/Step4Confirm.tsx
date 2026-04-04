"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  type FullRegistrationData,
  YONALISH_LABELS,
  YOSH_GURUH_LABELS,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  Loader2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { RegisterFormContent } from "@/lib/site-content";

interface Props {
  data: FullRegistrationData;
  onBack: () => void;
  content?: RegisterFormContent;
}

export function Step4Confirm({ data, onBack, content }: Props) {
  const common = content?.common;
  const step4 = content?.step4;
  const router = useRouter();
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

  const handleSubmit = async () => {
    setLoading(true);
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
        const params = new URLSearchParams({
          phone: data.telefon,
          id: participantId,
        });
        toast.success("Ro'yxatdan o'tdingiz");
        router.replace(`/profile/login?${params.toString()}`);
      } else if (res.status === 409) {
        toast.error("Bu telefon raqam allaqachon ro'yxatdan o'tgan");
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
    <div className="space-y-6">
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
    </div>
  );
}
