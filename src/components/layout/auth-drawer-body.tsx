"use client";

import { User, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LABELS } from "@/config/constants";
import { useSidePanelStore } from "@/hooks/use-side-panel-store";
import { LoginForm, RegisterForm } from "@/modules/auth/auth-forms";

interface AuthDrawerBodyProps {
  onClose: () => void;
}

export function AuthDrawerBody({ onClose }: AuthDrawerBodyProps) {
  const mode = useSidePanelStore((s) => s.mode);
  const openLogin = useSidePanelStore((s) => s.openLogin);
  const openRegister = useSidePanelStore((s) => s.openRegister);
  const isRegister = mode === "register";

  return (
    <>
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          {isRegister ? <UserPlus className="size-5 text-primary" /> : <User className="size-5 text-primary" />}
          <h2 className="text-lg font-extrabold tracking-tight">
            {isRegister ? LABELS.register : LABELS.login}
          </h2>
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full bg-primary/10 text-primary hover:bg-primary/15"
          onClick={onClose}
          aria-label="Kapat"
        >
          <X className="size-5" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {isRegister ? (
          <RegisterForm embedded onSuccess={onClose} onSwitchToLogin={openLogin} />
        ) : (
          <LoginForm embedded onSuccess={onClose} onSwitchToRegister={openRegister} />
        )}
      </div>
    </>
  );
}
