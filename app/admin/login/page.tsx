import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createAdminSessionValue, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { adminSessionCookieOptions } from "@/lib/session-cookie";

async function loginAction(formData: FormData) {
  "use server";

  const key = String(formData.get("key") ?? "");
  if (!process.env.ADMIN_SECRET_KEY || key !== process.env.ADMIN_SECRET_KEY) {
    redirect("/admin/login?error=invalid");
  }

  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, createAdminSessionValue(), adminSessionCookieOptions());
  redirect("/admin");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="ui-surface w-full max-w-sm p-6">
        <h1 className="mb-2 font-display text-2xl font-bold">Admin login</h1>
        <p className="mb-5 text-sm text-muted-foreground">
          Admin panelga kirish uchun maxfiy kalitni kiriting.
        </p>

        {params.error === "invalid" ? (
          <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            Kalit noto&apos;g&apos;ri. Qayta urinib ko&apos;ring.
          </p>
        ) : null}

        <form action={loginAction} className="space-y-4">
          <label className="block text-sm font-medium">
            Admin key
            <input
              type="password"
              name="key"
              required
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-electric-blue/60 focus:ring-2 focus:ring-electric-blue/30"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-electric-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2F73EA]"
          >
            Kirish
          </button>
        </form>
      </div>
    </div>
  );
}
