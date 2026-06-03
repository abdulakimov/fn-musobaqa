"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { DownloadIcon, Loader2Icon, MapPinIcon, TicketIcon } from "lucide-react";
import { toPng } from "html-to-image";
import { appToast as toast } from "@/lib/toast";
import { ParticipantIdCopy } from "@/components/profile/ParticipantIdCopy";

interface CompetitionTicketCardProps {
  participantId: string;
  visitText: string;
  directionLabel: string;
  address: string;
  mapUrl?: string;
  className?: string;
}

function sanitizeId(raw: string) {
  return String(raw ?? "").trim().toUpperCase() || "ID";
}

function getExportAddressSizeClass(value: string) {
  const len = value.trim().length;
  if (len > 68) return "text-[28px]";
  if (len > 58) return "text-[31px]";
  if (len > 48) return "text-[34px]";
  return "text-[35px]";
}

export function CompetitionTicketCard({
  participantId,
  visitText,
  directionLabel,
  address,
  mapUrl,
  className,
}: CompetitionTicketCardProps) {
  const ticketRef = useRef<HTMLDivElement | null>(null);
  const exportTicketRef = useRef<HTMLDivElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const normalizedId = sanitizeId(participantId);
  const exportAddressSizeClass = getExportAddressSizeClass(address);
  const detailRows = [
    { label: "Musobaqa vaqti", value: visitText, oneLine: true, align: "right" as const },
    { label: "Yo'nalish", value: directionLabel, oneLine: true, align: "right" as const },
    { label: "Manzil", value: address, oneLine: true, align: "right" as const },
  ];

  const downloadTicket = async () => {
    const exportNode = exportTicketRef.current ?? ticketRef.current;
    if (!exportNode) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(exportNode, {
        cacheBust: true,
        pixelRatio: 2,
        canvasWidth: 1600,
        canvasHeight: 840,
        filter: (node) => !node.classList?.contains("ticket-export-hidden"),
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `bilet-${normalizedId}.png`;
      link.click();
      toast.success("Bilet yuklab olindi");
    } catch {
      toast.error("Biletni yuklab bo'lmadi");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`mx-auto w-full max-w-2xl ${className ?? ""}`.trim()}>
      <div
        ref={ticketRef}
        className="relative overflow-hidden rounded-2xl border border-electric-blue/25 bg-white p-5 shadow-[0_14px_35px_-25px_rgba(43,128,255,0.65)] sm:p-6"
      >
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_0%_0%,rgba(70,142,255,0.16),rgba(70,142,255,0.04)_42%,rgba(255,255,255,0)_75%)]" />
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[radial-gradient(circle_at_20%_20%,rgba(249,105,51,0.18),rgba(249,105,51,0)_70%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[linear-gradient(90deg,#2D7FF8_0%,#68A7FF_55%,#FCA41C_100%)]" />

        <div className="relative z-10">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-electric-blue/25 bg-electric-blue/10 px-3 py-1 text-xs font-semibold text-electric-blue">
            <TicketIcon className="h-4 w-4 shrink-0 text-electric-blue" strokeWidth={2} />
            Musobaqa bileti
          </p>

          <div className="mb-4">
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h3 className="font-hero text-5xl font-extrabold leading-none tracking-[0.05em] text-electric-blue sm:text-6xl">
                {normalizedId}
              </h3>
              <ParticipantIdCopy
                participantId={normalizedId}
                className={`ml-0 h-7 ${downloading ? "ticket-export-hidden" : ""}`}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-white/80 p-3.5">
            <div className="relative pl-7">
              <div className="pointer-events-none absolute bottom-2 left-[9px] top-2 w-px bg-border/75" />
              {detailRows.map((row, index) => (
                <div key={row.label}>
                  {index > 0 ? <div className="my-2 h-px w-full bg-border/70" /> : null}
                  <p className="relative grid gap-2 py-1 text-sm sm:grid-cols-[minmax(120px,170px)_minmax(0,1fr)] sm:items-start sm:gap-3">
                    <span className="inline-flex items-center text-muted-foreground">
                      <span className="absolute -left-[22px] top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full bg-electric-blue" />
                      {row.label}
                    </span>
                    <strong
                      className={
                        row.oneLine
                          ? row.align === "right"
                            ? "w-full text-left sm:text-right sm:whitespace-nowrap"
                            : "w-full text-left sm:whitespace-nowrap"
                          : "w-full text-left"
                      }
                    >
                      {row.value}
                    </strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={downloadTicket}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-lg bg-electric-blue px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2F73EA] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {downloading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <DownloadIcon className="h-4 w-4 shrink-0 text-white" strokeWidth={2} />}
          Biletni yuklab olish
        </button>
        {mapUrl ? (
          <Link
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-electric-blue/40 hover:text-electric-blue"
          >
            <MapPinIcon className="h-4 w-4 shrink-0 text-electric-blue" strokeWidth={2} />
            Manzilni ochish
          </Link>
        ) : null}
      </div>

      <div className="pointer-events-none fixed -left-[99999px] top-0 opacity-0">
        <div
          ref={exportTicketRef}
          className="relative h-[840px] w-[1600px] overflow-hidden rounded-[30px] border border-[#B8CCFF] bg-[#F9FBFF] p-12 text-[#1A1650]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_0%_0%,rgba(70,142,255,0.14),rgba(70,142,255,0.02)_44%,rgba(255,255,255,0)_78%)]" />
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_20%_20%,rgba(249,105,51,0.14),rgba(249,105,51,0)_70%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-[6px] bg-[linear-gradient(90deg,#2D7FF8_0%,#68A7FF_55%,#FCA41C_100%)]" />

          <div className="relative z-10 flex h-full flex-col">
            <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-electric-blue/25 bg-electric-blue/10 px-5 py-2 text-[34px] font-semibold text-electric-blue">
              <TicketIcon className="h-8 w-8 shrink-0 text-electric-blue" strokeWidth={2} />
              Musobaqa bileti
            </p>

            <div className="mb-8">
              <h3 className="font-hero text-[132px] leading-none font-extrabold tracking-[0.05em] text-electric-blue">
                {normalizedId}
              </h3>
            </div>

            <div className="rounded-[26px] border border-border/70 bg-white/90 p-8">
              <div className="relative pl-14">
                <div className="pointer-events-none absolute bottom-3 left-5 top-3 w-[2px] bg-[#CCD7F5]" />
                {detailRows.map((row, index) => (
                  <div key={`export-${row.label}`}>
                    {index > 0 ? <div className="my-4 h-px w-full bg-[#D8E0F6]" /> : null}
                    <div className="relative flex items-center justify-between gap-5 py-1">
                      <span className="inline-flex items-center text-[44px] leading-none font-medium text-[#58709A]">
                        <span className="absolute -left-[36px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-electric-blue" />
                        {row.label}
                      </span>
                      <strong
                        className={
                          row.label === "Manzil"
                            ? `ml-5 max-w-[920px] whitespace-nowrap text-right ${exportAddressSizeClass} leading-none font-semibold tracking-[-0.01em]`
                            : "ml-5 max-w-[920px] whitespace-nowrap text-right text-[54px] leading-none font-bold tracking-[-0.01em]"
                        }
                      >
                        {row.value}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
