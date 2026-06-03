const TASHKENT_TIME_ZONE = "Asia/Tashkent";

const VISIT_SCHEDULE: Record<string, string> = {
  A: "2026-04-19T09:00:00+05:00",
  B: "2026-04-19T10:00:00+05:00",
  C: "2026-04-19T11:00:00+05:00",
  D: "2026-04-19T12:00:00+05:00",
  K: "2026-04-18T09:00:00+05:00",
  T: "2026-04-18T11:00:00+05:00",
};

export function getVisitScheduleForParticipantId(participantId: string) {
  const prefix = String(participantId ?? "").trim().toUpperCase().charAt(0);
  const iso = VISIT_SCHEDULE[prefix];
  if (!iso) {
    return null;
  }

  const date = new Date(iso);
  return {
    prefix,
    scheduledAt: iso,
    displayText: new Intl.DateTimeFormat("uz-UZ", {
      timeZone: TASHKENT_TIME_ZONE,
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date),
  };
}
