const UZ_PREFIX = "+998";

export function extractUzLocalDigits(input: string) {
  const digitsOnly = input.replace(/\D/g, "");
  if (digitsOnly.startsWith("998")) return digitsOnly.slice(3);
  if (digitsOnly.startsWith("0")) return digitsOnly.slice(1);
  return digitsOnly;
}

export function tryNormalizeUzPhone(input: string) {
  const digitsOnly = input.replace(/\D/g, "");
  let localDigits = "";

  if (digitsOnly.startsWith("998")) {
    localDigits = digitsOnly.slice(3);
  } else if (digitsOnly.startsWith("0")) {
    localDigits = digitsOnly.slice(1);
  } else {
    localDigits = digitsOnly;
  }

  if (!/^\d{9}$/.test(localDigits)) {
    return null;
  }

  return `${UZ_PREFIX}${localDigits}`;
}

export function normalizeUzPhone(input: string) {
  const normalized = tryNormalizeUzPhone(input);
  if (!normalized) {
    throw new Error("INVALID_UZ_PHONE");
  }
  return normalized;
}

export function formatUzPhone(input: string) {
  const local = extractUzLocalDigits(input);
  const part1 = local.slice(0, 2);
  const part2 = local.slice(2, 5);
  const part3 = local.slice(5, 7);
  const part4 = local.slice(7, 9);
  const overflow = local.slice(9);

  let formatted = UZ_PREFIX;
  if (part1) formatted += ` ${part1}`;
  if (part2) formatted += `-${part2}`;
  if (part3) formatted += `-${part3}`;
  if (part4) formatted += `-${part4}`;
  if (overflow) formatted += overflow;

  return formatted;
}

export { UZ_PREFIX };
