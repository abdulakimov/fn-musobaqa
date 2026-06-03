import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LogOutIcon, MapPinIcon } from "lucide-react";
import { db } from "@/lib/db";
import {
  getParticipantRecordIdFromSession,
  PARTICIPANT_SESSION_COOKIE,
} from "@/lib/participant-auth";
import { YONALISH_LABELS, YOSH_GURUH_LABELS } from "@/lib/validations";
import { STATIC_SITE_SETTINGS } from "@/lib/site-content";
import { ParticipantIdCopy } from "@/components/profile/ParticipantIdCopy";
import { getVisitScheduleForParticipantId } from "@/lib/visit-schedule";
import { CompetitionTicketCard } from "@/components/shared/CompetitionTicketCard";

export default async function ProfilePage() {
  const store = await cookies();
  const sessionValue = store.get(PARTICIPANT_SESSION_COOKIE)?.value;
  const participantRecordId = getParticipantRecordIdFromSession(sessionValue);

  if (!participantRecordId) {
    redirect("/profile/login");
  }

  const participant = await db.royxat.findUnique({
    where: { id: participantRecordId },
  });

  if (!participant) {
    redirect("/profile/logout?next=/profile/login%3Ferror%3Dcredentials");
  }

  const address = STATIC_SITE_SETTINGS.address ?? "Farg'ona viloyati, Fag'ona shahri, Najot Ta'lim binosi";
  const mapUrl = STATIC_SITE_SETTINGS.mapUrl ?? "https://yandex.uz/maps/-/CPfhBImd";
  const visitInfo = getVisitScheduleForParticipantId(participant.participantId ?? "");
  const visitText = visitInfo?.displayText ?? "Tashrif vaqti aniqlanmadi";
  const directionLabel = YONALISH_LABELS[participant.yonalish] ?? participant.yonalish;

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header className="ui-surface flex flex-wrap items-center gap-3 p-5">
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold">Ishtirokchi profili</h1>
            <p className="text-sm text-muted-foreground">
              Nizom bilan tanishing va rasmiy natijalarni Telegram kanalida kuzating.
            </p>
          </div>
          <form action="/profile/logout" method="post">
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-electric-blue"
            >
              <LogOutIcon className="h-4 w-4" />
              Chiqish
            </button>
          </form>
        </header>

        <section className="ui-surface p-5 sm:p-6">
          <h2 className="mb-4 text-base font-semibold">Asosiy ma&apos;lumotlar</h2>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <p><span className="text-muted-foreground">F.I.Sh:</span> <strong>{participant.familiya} {participant.ism} {participant.otasiningIsmi}</strong></p>
            <p><span className="text-muted-foreground">Telefon:</span> <strong>{participant.telefon}</strong></p>
            <p>
              <span className="text-muted-foreground">ID:</span>{" "}
              <strong>{participant.participantId ?? "-"}</strong>
              {participant.participantId ? <ParticipantIdCopy participantId={participant.participantId} /> : null}
            </p>
            <p><span className="text-muted-foreground">Yo&apos;nalish:</span> <strong>{YONALISH_LABELS[participant.yonalish] ?? participant.yonalish}</strong></p>
            <p><span className="text-muted-foreground">Yosh guruhi:</span> <strong>{YOSH_GURUH_LABELS[participant.yoshGuruhi] ?? participant.yoshGuruhi}</strong></p>
          </div>
        </section>

        <section className="ui-surface p-5 sm:p-6">
          <h2 className="mb-4 text-base font-semibold">Musobaqa bileti</h2>
          <CompetitionTicketCard
            participantId={participant.participantId ?? "-"}
            visitText={visitText}
            directionLabel={directionLabel}
            address={address}
            mapUrl={mapUrl}
          />
        </section>

        <section className="ui-surface p-5 sm:p-6">
          <h2 className="mb-4 text-base font-semibold">Natijalar e&apos;loni</h2>
          <p className="text-sm text-muted-foreground">
            Natijalar profilda e&apos;lon qilinmaydi. Yakuniy natijalar rasmiy Telegram kanalida beriladi.
          </p>
          <a
            href={STATIC_SITE_SETTINGS.telegram ?? "https://t.me/robbituz"}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-electric-blue underline underline-offset-2"
          >
            Telegram kanaliga o&apos;tish
          </a>
        </section>

        <section className="ui-surface p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Musobaqa nizomi</h2>
            <a
              href={STATIC_SITE_SETTINGS.nizomPdfUrl ?? "/docs/nizom.pdf"}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-electric-blue underline underline-offset-2"
            >
              Nizomni o&apos;qish uchun link ustiga bosing
            </a>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">
            Musobaqa nizomini o&apos;qish uchun yuqoridagi linkni bosing.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {(STATIC_SITE_SETTINGS.nizomText ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="ui-surface p-5 sm:p-6">
          <h2 className="mb-4 text-base font-semibold">Manzil</h2>
          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-electric-blue"
          >
            <MapPinIcon className="h-4 w-4 text-electric-blue" />
            {address}
          </a>
        </section>

        <Link href="/" className="inline-flex text-sm text-electric-blue hover:underline">
          Bosh sahifaga qaytish
        </Link>
      </div>
    </main>
  );
}
