"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step1Schema, type Step1Data } from "@/lib/validations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import type { RegisterFormContent } from "@/lib/site-content";
import { extractUzLocalDigits, formatUzPhone, UZ_PREFIX } from "@/lib/phone";

interface Props {
  defaultValues: Partial<Step1Data>;
  onNext: (data: Step1Data) => void;
  content?: RegisterFormContent;
}

export function Step1Personal({ defaultValues, onNext, content }: Props) {
  const common = content?.common;
  const step1 = content?.step1;
  const mathAgeOptions = [
    { value: "YOSH_9_11", label: "9-11 yosh" },
    { value: "YOSH_12_14", label: "12-14 yosh" },
  ];
  const typingAgeOptions = [{ value: "YOSH_9_14", label: "9-14 yosh" }];
  const directionOptions =
    step1?.directionOptions?.length === 2
      ? step1.directionOptions
      : [
          { value: "MATEMATIKA", label: "Matematika" },
          { value: "TYPING", label: "Typing" },
        ];

  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      ism: defaultValues.ism ?? "",
      familiya: defaultValues.familiya ?? "",
      otasiningIsmi: defaultValues.otasiningIsmi ?? "",
      telefon: formatUzPhone(defaultValues.telefon ?? ""),
      yonalish: defaultValues.yonalish,
      yoshGuruhi: defaultValues.yoshGuruhi,
    },
  });

  const onSubmit = (values: Step1Data) => {
    const normalized = { ...values, telefon: `${UZ_PREFIX}${extractUzLocalDigits(values.telefon)}` };
    onNext(normalized);
  };

  const selectedDirection = useWatch({ control: form.control, name: "yonalish" });
  const selectedAge = useWatch({ control: form.control, name: "yoshGuruhi" });
  const ageOptions = selectedDirection === "TYPING" ? typingAgeOptions : mathAgeOptions;
  const selectedDirectionLabel = directionOptions.find((option) => option.value === selectedDirection)?.label;
  const selectedAgeLabel = ageOptions.find((option) => option.value === selectedAge)?.label;

  useEffect(() => {
    if (!selectedDirection) return;
    const allowedAgeValues = ageOptions.map((option) => option.value);
    if (!selectedAge || !allowedAgeValues.includes(selectedAge)) {
      form.setValue("yoshGuruhi", ageOptions[0]?.value as Step1Data["yoshGuruhi"], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [selectedDirection, selectedAge, ageOptions, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="ism"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{step1?.firstNameLabel ?? "Ism"}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={step1?.firstNamePlaceholder ?? "Abdulloh"}
                    className="h-11 rounded-xl bg-background px-3.5"
                    {...field}
                  />
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
                <FormLabel>{step1?.lastNameLabel ?? "Familiya"}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={step1?.lastNamePlaceholder ?? "Karimov"}
                    className="h-11 rounded-xl bg-background px-3.5"
                    {...field}
                  />
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
              <FormLabel>{step1?.middleNameLabel ?? "Otasining ismi"}</FormLabel>
              <FormControl>
                <Input
                  placeholder={step1?.middleNamePlaceholder ?? "Bahodir o'g'li"}
                  className="h-11 rounded-xl bg-background px-3.5"
                  {...field}
                />
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
              <FormLabel>{step1?.phoneLabel ?? "Telefon raqami"}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder={step1?.phonePlaceholder ?? "+998 91-234-56-73"}
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="yonalish"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{step1?.directionLabel ?? "Yo'nalish"}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? null}>
                  <FormControl>
                    <SelectTrigger className="h-11 w-full rounded-xl bg-background px-3.5">
                      <SelectValue placeholder={step1?.directionPlaceholder ?? "Yo'nalishni tanlang"}>
                        {selectedDirectionLabel}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {directionOptions.map((option) => (
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

          <FormField
            control={form.control}
            name="yoshGuruhi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{step1?.ageGroupLabel ?? "Yosh guruhi"}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? null}>
                  <FormControl>
                    <SelectTrigger className="h-11 w-full rounded-xl bg-background px-3.5" disabled={!selectedDirection}>
                      <SelectValue placeholder={step1?.ageGroupPlaceholder ?? "Yosh guruhini tanlang"}>
                        {selectedAgeLabel}
                      </SelectValue>
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

        <Button
          type="submit"
          className="h-12 w-full gap-2 rounded-full bg-electric-blue text-base font-semibold text-background hover:bg-electric-blue/90"
        >
          {common?.nextText ?? content?.nextText ?? "Davom etish"}
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
}
