interface RegistrationSmsTextInput {
  participantId: string;
}

export function buildRegistrationSmsText(input: RegistrationSmsTextInput) {
  return [
    "Tabriklaymiz! Siz Robbit musobaqasiga ro'yxatdan o'tdingiz.",
    "",
    `ID: ${input.participantId} Manzil: Farg'ona shahri, Najot Ta'lim binosi`,
    "",
    "Sizga 78-777-3-777 raqamidan aloqaga chiqamiz",
  ].join("\n");
}
