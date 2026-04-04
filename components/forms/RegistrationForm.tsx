"use client";

import { useState } from "react";
import { FormProgress } from "./FormProgress";
import { Step1Personal } from "./steps/Step1Personal";
import { Step4Confirm } from "./steps/Step4Confirm";
import type { FullRegistrationData } from "@/lib/validations";
import type { RegisterFormContent } from "@/lib/site-content";

const DEFAULT_STEPS = ["Shaxsiy", "Tasdiqlash"];

interface RegistrationFormProps {
  content?: RegisterFormContent;
}

export function RegistrationForm({ content }: RegistrationFormProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<FullRegistrationData>>({});
  const steps = content?.stepLabels?.length === 2 ? content.stepLabels : DEFAULT_STEPS;

  const next = (stepData: Partial<FullRegistrationData>) => {
    setData((prev) => ({ ...prev, ...stepData }));
    setStep((s) => s + 1);
  };

  const back = () => {
    setStep((s) => s - 1);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <FormProgress steps={steps} current={step} />

      <div className="ui-surface p-6 sm:p-10">
        {step === 0 && <Step1Personal defaultValues={data} onNext={next} content={content} />}
        {step === 1 && <Step4Confirm data={data as FullRegistrationData} onBack={back} content={content} />}
      </div>
    </div>
  );
}
