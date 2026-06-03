"use client";

import { Toaster } from "sonner";
import { AlertCircleIcon, AlertTriangleIcon, CheckCircle2Icon, InfoIcon } from "lucide-react";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      closeButton={false}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: "app-toast",
          title: "app-toast-title",
          description: "app-toast-description",
        },
      }}
      icons={{
        success: <CheckCircle2Icon className="app-toast-icon app-toast-icon-success" />,
        error: <AlertCircleIcon className="app-toast-icon app-toast-icon-error" />,
        warning: <AlertTriangleIcon className="app-toast-icon app-toast-icon-warning" />,
        info: <InfoIcon className="app-toast-icon app-toast-icon-info" />,
      }}
    />
  );
}
