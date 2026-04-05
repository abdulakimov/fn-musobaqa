"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatUzPhone, UZ_PREFIX } from "@/lib/phone";

interface ProfileLoginFormProps {
  defaultPhone?: string;
  defaultParticipantId?: string;
  errorMessage?: string | null;
}

export function ProfileLoginForm({
  defaultPhone = "",
  defaultParticipantId = "",
  errorMessage,
}: ProfileLoginFormProps) {
  const router = useRouter();
  const [telefon, setTelefon] = useState(formatUzPhone(defaultPhone));
  const [participantId, setParticipantId] = useState(defaultParticipantId.toUpperCase());
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/profile/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefon, participantId }),
      });

      const json = await res.json();

      if (res.ok) {
        router.replace("/profile");
        router.refresh();
        return;
      }

      if (res.status === 404 && json?.code === "NOT_REGISTERED") {
        toast.error("Siz ro'yxatdan o'tmagansiz. Avval ro'yxatdan o'ting.");
        router.replace("/register");
        return;
      }

      toast.error(json?.error ?? "Kirishda xatolik yuz berdi");
    } catch {
      toast.error("Tarmoq xatosi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {errorMessage ? (
        <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <label className="block text-sm font-medium">
        Telefon raqami
        <input
          type="text"
          name="telefon"
          required
          value={telefon}
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="+998 91-234-56-73"
          className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-electric-blue/60 focus:ring-2 focus:ring-electric-blue/30"
          onFocus={() => {
            if (!telefon) setTelefon(UZ_PREFIX);
          }}
          onChange={(event) => setTelefon(formatUzPhone(event.target.value))}
          onPaste={(event) => {
            event.preventDefault();
            setTelefon(formatUzPhone(event.clipboardData.getData("text")));
          }}
        />
      </label>

      <label className="block text-sm font-medium">
        Ishtirokchi ID
        <input
          type="text"
          name="participantId"
          required
          value={participantId}
          placeholder="A1111 yoki T1111"
          className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm uppercase outline-none focus:border-electric-blue/60 focus:ring-2 focus:ring-electric-blue/30"
          onChange={(event) => setParticipantId(event.target.value.toUpperCase())}
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="h-11 w-full cursor-pointer rounded-xl bg-electric-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2F73EA] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Tekshirilmoqda..." : "Kirish"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Hali ro&apos;yxatdan o&apos;tmaganmisiz?{" "}
        <Link href="/register" className="font-medium text-electric-blue hover:underline">
          Ro&apos;yxatdan o&apos;tish
        </Link>
      </p>
    </form>
  );
}
