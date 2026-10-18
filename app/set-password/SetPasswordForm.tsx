"use client";

import { useActionState } from "react";
import { setNewPassword } from "@/app/actions/auth";
import { FormMessage, inputClass, primaryButtonClass } from "@/components/AuthCard";
import { MIN_PASSWORD } from "@/lib/authRules";

export default function SetPasswordForm() {
  const [state, action, pending] = useActionState(setNewPassword, null);

  return (
    <form action={action} className="mt-8 space-y-3 text-left">
      <label className="block">
        <span className="mb-1.5 block pl-4 text-xs tracking-widest text-muted">新密碼（至少 {MIN_PASSWORD} 個字元）</span>
        <input
          name="newPassword"
          type="password"
          required
          minLength={MIN_PASSWORD}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      <FormMessage error={state?.error} />
      <button type="submit" disabled={pending} className={`${primaryButtonClass} !mt-5`}>
        {pending ? "儲存中⋯" : "設定新密碼"}
      </button>
    </form>
  );
}
