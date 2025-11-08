"use client";

import React from "react";

export interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  durationMs?: number;
}

export default function Toast({
  message,
  show,
  onClose,
  durationMs = 3000,
}: ToastProps) {
  React.useEffect(() => {
    if (!show) return;
    const id = setTimeout(() => {
      onClose();
    }, durationMs);
    return () => clearTimeout(id);
  }, [show, durationMs, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 mx-auto w-full max-w-md px-4">
      <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 shadow">
        {message}
      </div>
    </div>
  );
}


