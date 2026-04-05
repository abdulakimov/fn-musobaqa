import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LogOutIcon } from "lucide-react";
import { db } from "@/lib/db";
import {
  getParticipantRecordIdFromSession,
  PARTICIPANT_SESSION_COOKIE,
} from "@/lib/participant-auth";
import { YONALISH_LABELS, YOSH_GURUH_LABELS } from "@/lib/validations";
import { ParticipantIdCopy } from "@/components/profile/ParticipantIdCopy";

function formatDate(value: Date | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

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

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header className="ui-surface flex flex-wrap items-center gap-3 p-5">
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold">Ishtirokchi profili</h1>
            <p className="text-sm text-muted-foreground">Natijalarni shu joydan kuzatib boring.</p>
          </div>
          <Link
            href="/profile/logout"
            prefetch={false}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-electric-blue"
          >
            <LogOutIcon className="h-4 w-4" />
            Chiqish
          </Link>
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
          <h2 className="mb-4 text-base font-semibold">Natija</h2>
          {participant.resultStatus || participant.resultScore !== null || participant.resultNote ? (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Status:</span> <strong>{participant.resultStatus ?? "-"}</strong></p>
              <p><span className="text-muted-foreground">Ball:</span> <strong>{participant.resultScore ?? "-"}</strong></p>
              <p><span className="text-muted-foreground">Izoh:</span> <strong>{participant.resultNote ?? "-"}</strong></p>
              <p><span className="text-muted-foreground">Yangilangan:</span> <strong>{formatDate(participant.resultUpdatedAt)}</strong></p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Natijalar hali e&apos;lon qilinmagan.</p>
          )}
        </section>

        <Link href="/" className="inline-flex text-sm text-electric-blue hover:underline">
          Bosh sahifaga qaytish
        </Link>
      </div>
    </main>
  );
}
