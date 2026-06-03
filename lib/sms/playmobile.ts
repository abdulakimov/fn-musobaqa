const DEFAULT_SMS_BASE_URL = "https://send.smsxabar.uz/broker-api";
const DEFAULT_SMS_ORIGINATOR = "3700";

export class SmsConfigError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class SmsSendError extends Error {
  constructor(message: string) {
    super(message);
  }
}

function normalizeRecipient(phone: string) {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (/^998\d{9}$/.test(digits)) {
    return digits;
  }
  throw new SmsSendError("Invalid recipient format");
}

function buildMessageId(registrationId: string) {
  const compact = String(registrationId ?? "").replace(/[^a-zA-Z0-9]/g, "");
  return `reg${compact.slice(-17)}`.slice(0, 20);
}

function toBasicAuth(login: string, password: string) {
  const value = `${login}:${password}`;
  return Buffer.from(value, "utf8").toString("base64");
}

export function isSmsEnabled() {
  return process.env.SMS_ENABLED !== "0";
}

export function getSmsConfig() {
  const login = process.env.SMS_LOGIN?.trim();
  const password = process.env.SMS_PASSWORD?.trim();
  const baseUrl = (process.env.SMS_BASE_URL?.trim() || DEFAULT_SMS_BASE_URL).replace(/\/+$/, "");
  const originator = process.env.SMS_ORIGINATOR?.trim() || DEFAULT_SMS_ORIGINATOR;

  if (!login || !password) {
    throw new SmsConfigError("SMS_LOGIN va SMS_PASSWORD talab qilinadi");
  }

  return {
    login,
    password,
    baseUrl,
    originator,
  };
}

export interface SendRegistrationSmsInput {
  registrationId: string;
  phone: string;
  text: string;
}

export async function sendRegistrationSms(input: SendRegistrationSmsInput) {
  const { login, password, baseUrl, originator } = getSmsConfig();
  const recipient = normalizeRecipient(input.phone);
  const messageId = buildMessageId(input.registrationId);

  const payload = {
    messages: [
      {
        recipient,
        "message-id": messageId,
      },
    ],
    sms: {
      originator,
      content: {
        text: input.text,
      },
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`${baseUrl}/send`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${toBasicAuth(login, password)}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const bodyText = (await response.text()).trim();
    if (!response.ok) {
      throw new SmsSendError(bodyText || `SMS provider HTTP ${response.status}`);
    }

    return {
      messageId,
      providerResponse: bodyText || "OK",
    };
  } catch (error) {
    if (error instanceof SmsSendError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new SmsSendError(error.message);
    }
    throw new SmsSendError("Unknown SMS error");
  } finally {
    clearTimeout(timeout);
  }
}
