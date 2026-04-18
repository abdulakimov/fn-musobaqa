"use client";

import { toast as sonnerToast } from "sonner";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
  description?: string;
}

const TYPE_CLASS: Record<ToastType, string> = {
  success: "app-toast-success",
  error: "app-toast-error",
  info: "app-toast-info",
  warning: "app-toast-warning",
};

function emit(type: ToastType, message: string, options?: ToastOptions) {
  sonnerToast[type](message, {
    description: options?.description,
    className: TYPE_CLASS[type],
  });
}

export const appToast = {
  success(message: string, options?: ToastOptions) {
    emit("success", message, options);
  },
  error(message: string, options?: ToastOptions) {
    emit("error", message, options);
  },
  info(message: string, options?: ToastOptions) {
    emit("info", message, options);
  },
  warning(message: string, options?: ToastOptions) {
    emit("warning", message, options);
  },
};
