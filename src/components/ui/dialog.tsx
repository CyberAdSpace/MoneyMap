"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { type HTMLAttributes, type ReactNode, useEffect } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Dialog({ open, onClose, children }: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-card border border-border shadow-lg mx-4">
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, children, onClose, ...props }: HTMLAttributes<HTMLDivElement> & { onClose?: () => void }) {
  return (
    <div className={cn("flex items-center justify-between p-6 pb-0", className)} {...props}>
      <div>{children}</div>
      {onClose && (
        <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-accent">
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />;
}

export function DialogContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex justify-end gap-3 p-6 pt-0", className)} {...props} />;
}
