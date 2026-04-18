"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, UserPlusIcon, XIcon } from "lucide-react";
import { appToast as toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { YONALISH_LABELS, YOSH_GURUH_LABELS, step1Schema, type Step1Data } from "@/lib/validations";
import { formatUzPhone, UZ_PREFIX } from "@/lib/phone";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (payload: { id: string; participantId: string }) => void;
};

const INITIAL_FORM: Step1Data = {
  ism: "",
  familiya: "",
  otasiningIsmi: "",
  telefon: "+998",
  yonalish: "MATEMATIKA",
  yoshGuruhi: "YOSH_9_11",
};

export function AdminRegistrationDrawer({ open, onOpenChange, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successState, setSuccessState] = useState<{ id: string; participantId: string } | null>(null);

  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      ...INITIAL_FORM,
      telefon: formatUzPhone(INITIAL_FORM.telefon),
    },
  });
  const selectedDirection = useWatch({ control: form.control, name: "yonalish" });
  const selectedAge = useWatch({ control: form.control, name: "yoshGuruhi" });
  const mathAgeOptions = useMemo(
    () => [
      { value: "YOSH_9_11", label: "9-11 yosh" },
      { value: "YOSH_12_14", label: "12-14 yosh" },
    ] as const,
    [],
  );
  const typingAgeOptions = useMemo(() => [{ value: "YOSH_9_14", label: "9-14 yosh" }] as const, []);
  const ageOptions = selectedDirection === "TYPING" ? typingAgeOptions : mathAgeOptions;
  const selectedDirectionLabel = selectedDirection
    ? (YONALISH_LABELS[selectedDirection] ?? selectedDirection)
    : "";
  const selectedAgeLabel = selectedAge
    ? (YOSH_GURUH_LABELS[selectedAge] ?? selectedAge)
    : "";

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      form.reset({
        ...INITIAL_FORM,
        telefon: formatUzPhone(INITIAL_FORM.telefon),
      });
      setSubmitting(false);
      setErrorMessage(null);
      setSuccessState(null);
    }
  }, [form, open]);

  useEffect(() => {
    if (!selectedDirection) return;
    const allowedAgeValues = ageOptions.map((option) => option.value);
    if (!selectedAge || !allowedAgeValues.includes(selectedAge as (typeof allowedAgeValues)[number])) {
      form.setValue("yoshGuruhi", ageOptions[0].value, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [selectedDirection, selectedAge, ageOptions, form]);

  const handleSubmit = async (values: Step1Data) => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409 && json?.existing?.participantId) {
          setErrorMessage(`Bu telefon avval ro'yxatdan o'tgan: ${json.existing.participantId}`);
        } else if (res.status === 409) {
          setErrorMessage("Bu telefon raqam allaqachon ro'yxatdan o'tgan.");
        } else if (res.status === 503 && json?.code === "SCHEMA_MIGRATION_REQUIRED") {
          setErrorMessage("Serverda migratsiya yakunlanmagan. Migratsiyani qo'llab, qayta urinib ko'ring.");
        } else if (res.status === 403) {
          setErrorMessage(json?.error ?? "Ro'yxatdan o'tish yopilgan yoki joylar to'lgan.");
        } else if (res.status === 422) {
          const firstFieldError = json?.errors?.fieldErrors
            ? Object.values(json.errors.fieldErrors).flat().find((item: unknown) => typeof item === "string")
            : null;
          setErrorMessage((firstFieldError as string) ?? json?.error ?? "Ma'lumotlarda xatolik bor.");
        } else {
          setErrorMessage(json?.error ?? "Server xatosi yuz berdi.");
        }
        return;
      }

      const participantId = String(json?.participantId ?? "").trim();
      const id = String(json?.id ?? "").trim();
      if (!participantId || !id) {
        setErrorMessage("Ro'yxatdan o'tkazildi, lekin javob to'liq emas.");
        return;
      }

      setSuccessState({ id, participantId });
      onSuccess({ id, participantId });
      toast.success("Ishtirokchi qo'shildi");
    } catch {
      setErrorMessage("Tarmoq xatosi. Qayta urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        aria-label="Ishtirokchi qo'shish panelini yopish"
        className="absolute inset-0 bg-slate-900/45"
        onClick={() => onOpenChange(false)}
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl border-l border-border bg-background shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="border-b border-border px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-1 rounded-full bg-electric-blue/10 px-2 py-1 text-[11px] font-medium text-electric-blue">
                  <UserPlusIcon className="h-3.5 w-3.5" />
                  Admin feature
                </p>
                <h2 className="mt-2 text-lg font-semibold">Ishtirokchi qo&apos;shish</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Admin panel orqali yangi ishtirokchi qo&apos;shing. Public deadline/limit bu yerda qo&apos;llanmaydi.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {successState ? (
              <div className="space-y-4 rounded-2xl border border-emerald-300/70 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-800">Muvaffaqiyatli qo&apos;shildi</p>
                <p className="text-sm text-emerald-900">
                  Ishtirokchi ID: <span className="font-bold">{successState.participantId}</span>
                </p>
                <Button className="w-full" onClick={() => onOpenChange(false)}>
                  Yopish
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form id="admin-registration-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="ism"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ism</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-11 rounded-xl bg-background px-3.5" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="familiya"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Familiya</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-11 rounded-xl bg-background px-3.5" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="otasiningIsmi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Otasining ismi</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11 rounded-xl bg-background px-3.5" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telefon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            inputMode="numeric"
                            autoComplete="tel-national"
                            className="h-11 rounded-xl bg-background px-3.5 tracking-[0.01em]"
                            onFocus={() => {
                              if (!field.value) field.onChange(UZ_PREFIX);
                            }}
                            onChange={(event) => {
                              field.onChange(formatUzPhone(event.target.value));
                            }}
                            onPaste={(event) => {
                              event.preventDefault();
                              field.onChange(formatUzPhone(event.clipboardData.getData("text")));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="yonalish"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Yo&apos;nalish</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? null}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl bg-background px-3.5">
                                <SelectValue placeholder="Yo'nalishni tanlang">{selectedDirectionLabel}</SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MATEMATIKA">Matematika</SelectItem>
                              <SelectItem value="TYPING">Typing</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="yoshGuruhi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Yosh guruhi</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? null}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl bg-background px-3.5" disabled={!selectedDirection}>
                                <SelectValue placeholder="Yosh guruhini tanlang">{selectedAgeLabel}</SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ageOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            )}

            {errorMessage ? (
              <div className="rounded-xl border border-rose-300/70 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {errorMessage}
              </div>
            ) : null}
          </div>

          {!successState ? (
            <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                Bekor qilish
              </Button>
              <Button
                type="submit"
                form="admin-registration-form"
                className="bg-electric-blue text-background hover:bg-electric-blue/90"
                disabled={submitting}
              >
                {submitting ? <Loader2Icon className="h-4 w-4 animate-spin" /> : "Ishtirokchini qo'shish"}
              </Button>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
