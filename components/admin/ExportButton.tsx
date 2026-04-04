"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";

interface ExportButtonProps {
  filters?: Record<string, string>;
}

export function ExportButton({ filters = {} }: ExportButtonProps) {
  const handleExport = () => {
    const params = new URLSearchParams({ format: "csv", ...filters });
    window.open(`/api/admin/registrations?${params}`, "_blank");
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
      <DownloadIcon className="w-4 h-4" />
      CSV yuklab olish
    </Button>
  );
}
