function normalizeNameToken(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function buildNameKey(input: {
  familiya: string;
  ism: string;
  otasiningIsmi: string;
}) {
  return [
    normalizeNameToken(input.familiya),
    normalizeNameToken(input.ism),
    normalizeNameToken(input.otasiningIsmi),
  ].join("|");
}

