const UZ_PREFIX = "+998";

export function extractUzLocalDigits(input: string) {
  const digitsOnly = input.replace(/\D/g, "");
  if (digitsOnly.startsWith("998")) return digitsOnly.slice(3, 12);
  if (digitsOnly.startsWith("0")) return digitsOnly.slice(1, 10);
  return digitsOnly.slice(0, 9);
}

export function normalizeUzPhone(input: string) {
  return `${UZ_PREFIX}${extractUzLocalDigits(input)}`;
}

export function formatUzPhone(input: string) {
  const local = extractUzLocalDigits(input);
  const part1 = local.slice(0, 2);
  const part2 = local.slice(2, 5);
  const part3 = local.slice(5, 7);
  const part4 = local.slice(7, 9);

  let formatted = UZ_PREFIX;
  if (part1) formatted += ` ${part1}`;
  if (part2) formatted += `-${part2}`;
  if (part3) formatted += `-${part3}`;
  if (part4) formatted += `-${part4}`;

  return formatted;
}

export { UZ_PREFIX };
