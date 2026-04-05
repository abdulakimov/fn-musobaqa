import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ProfileLoginForm } from "@/components/profile/ProfileLoginForm";
import { db } from "@/lib/db";
import {
  getParticipantRecordIdFromSession,
  PARTICIPANT_SESSION_COOKIE,
} from "@/lib/participant-auth";

export default async function ProfileLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; phone?: string; id?: string }>;
}) {
  const store = await cookies();
  const sessionValue = store.get(PARTICIPANT_SESSION_COOKIE)?.value;
  const participantRecordId = getParticipantRecordIdFromSession(sessionValue);

  if (participantRecordId) {
    const participantExists = await db.royxat.findUnique({
      where: { id: participantRecordId },
      select: { id: true },
    });

    if (participantExists) {
      redirect("/profile");
    }

    redirect("/profile/logout?next=/profile/login%3Ferror%3Dcredentials");
  }

  const params = await searchParams;
  const phone = params.phone ?? "";
  const participantId = (params.id ?? "").toUpperCase();

  const errorMessage =
    params.error === "phone"
      ? "Telefon formati noto'g'ri"
      : params.error === "id"
        ? "ID formati noto'g'ri"
        : params.error === "credentials"
          ? "Telefon yoki ID noto'g'ri"
          : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="ui-surface w-full max-w-md p-6 sm:p-8">
        <h1 className="mb-2 font-display text-2xl font-bold">Profilga kirish</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Telefon raqamingiz va berilgan ID orqali natijalarni ko&apos;rishingiz mumkin.
        </p>

        <ProfileLoginForm
          defaultPhone={phone}
          defaultParticipantId={participantId}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
}
