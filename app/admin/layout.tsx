import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { buildAdminAbsoluteUrl, shouldRedirectToAdminDomain } from "@/lib/admin-domain";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const reqHeaders = await headers();
  if (shouldRedirectToAdminDomain(reqHeaders)) {
    redirect(buildAdminAbsoluteUrl("/admin"));
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-card/60 px-6 py-4 backdrop-blur-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-electric-blue/10">
          <span className="font-hero text-xs font-black text-electric-blue">R</span>
        </div>
        <span className="font-display font-bold">Admin panel</span>
        <span className="ml-auto text-sm text-muted-foreground">Matematika + Typing 2026</span>
        <form action="/admin/logout" method="post">
          <button className="rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-electric-blue" type="submit">
            Chiqish
          </button>
        </form>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
