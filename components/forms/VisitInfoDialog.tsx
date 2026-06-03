"use client";

import { AlertTriangleIcon, ShieldAlertIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompetitionTicketCard } from "@/components/shared/CompetitionTicketCard";
import { Button } from "@/components/ui/button";

interface VisitInfoDialogProps {
  participantId: string;
  visitText: string;
  directionLabel: string;
  address: string;
  mapUrl?: string;
  telegramUrl?: string;
  warning: string;
  onDone: () => void;
}

export function VisitInfoDialog({
  participantId,
  visitText,
  directionLabel,
  address,
  mapUrl,
  telegramUrl,
  warning,
  onDone,
}: VisitInfoDialogProps) {
  return (
    <Dialog open>
      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100%-1.5rem)] rounded-2xl border border-amber-200 bg-white p-0 sm:max-w-3xl"
      >
        <div className="space-y-4 p-5 sm:p-6">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <ShieldAlertIcon className="h-5 w-5 text-[#F96933]" />
                Tashrif vaqti tasdiqlandi
              </DialogTitle>
              <DialogDescription className="text-sm">
                Ma&apos;lumotni diqqat bilan o&apos;qing va davom etishdan oldin biletni yuklab oling.
              </DialogDescription>
            </DialogHeader>

            <CompetitionTicketCard
              participantId={participantId}
              visitText={visitText}
              directionLabel={directionLabel}
              address={address}
              mapUrl={mapUrl}
              className="max-w-2xl"
            />

            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p className="inline-flex items-start gap-2">
                <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{warning}</span>
              </p>
              <p className="mt-2 text-xs text-red-700/90">
                Natijalar profilda e&apos;lon qilinmaydi. Rasmiy e&apos;lonlar Telegram kanalida chiqadi:
                {" "}
                <a
                  href={telegramUrl ?? "https://t.me/robbituz"}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold underline underline-offset-2"
                >
                  Telegram kanal
                </a>
              </p>
            </div>

            <Button
              type="button"
              onClick={onDone}
              className="h-11 w-full rounded-xl bg-electric-blue font-semibold text-background hover:bg-electric-blue/90"
            >
              Davom etish
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
