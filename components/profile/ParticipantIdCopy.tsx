"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "lucide-react";
import { toast } from "sonner";

interface ParticipantIdCopyProps {
  participantId: string;
}

export function ParticipantIdCopy({ participantId }: ParticipantIdCopyProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(participantId);
      setCopied(true);
      toast.success("ID nusxalandi");
      setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error("ID ni nusxalab bo'lmadi");
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="ml-2 inline-flex cursor-pointer items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs font-medium text-electric-blue transition-colors hover:bg-electric-blue/10"
      aria-label="ID ni nusxalash"
    >
      {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
      {copied ? "Nusxalandi" : "Nusxalash"}
    </button>
  );
}
