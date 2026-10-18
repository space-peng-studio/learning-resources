"use client";

import { useActionState } from "react";
import { changePassword, logout, updateName } from "@/app/actions/auth";
import { FormMessage, inputClass } from "@/components/AuthCard";
import { MAX_NAME, MIN_PASSWORD } from "@/lib/authRules";

const card = "rounded-[2rem] border border-white/70 bg-white/60 p-6 backdrop-blur sm:p-8";
const saveButton =
  "rounded-full bg-ink px-7 py-3 text-sm tracking-[0.25em] text-white transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0";
const labelText = "mb-1.5 block pl-4 text-xs tracking-widest text-muted";

export function NameForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState(updateName, null);
  return (
    <form action={action} className={`${card} space-y-4`}>
      <h2 className="font-serif text-xl font-bold tracking-wider text-ink">你的名字</h2>
      <p className="text-sm tracking-wide text-muted">我們會在首頁用這個名字跟你打招呼。</p>
      <label className="block">
        <span className={labelText}>名字</span>
        <input
          name="name"
          required
          maxLength={MAX_NAME}
          defaultValue={state?.values?.name ?? name}
          className={inputClass}
        />
      </label>
      <FormMessage error={state?.error} ok={state?.ok} />
      <button type="submit" disabled={pending} className={saveButton}>
        {pending ? "儲存中⋯" : "儲存"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);
  return (
    <form action={action} className={`${card} space-y-4`}>
      <h2 className="font-serif text-xl font-bold tracking-wider text-ink">修改密碼</h2>
      <label className="block">
        <span className={labelText}>目前的密碼</span>
        <input name="currentPassword" type="password" required autoComplete="current-password" className={inputClass} />
      </label>
      <label className="block">
        <span className={labelText}>新密碼（至少 {MIN_PASSWORD} 個字元）</span>
        <input
          name="newPassword"
          type="password"
          required
          minLength={MIN_PASSWORD}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      <FormMessage error={state?.error} ok={state?.ok} />
      <button type="submit" disabled={pending} className={saveButton}>
        {pending ? "儲存中⋯" : "更新密碼"}
      </button>
    </form>
  );
}

export function LogoutButton() {
  return (
    <form action={logout} className="text-center">
      <button
        type="submit"
        className="rounded-full border border-ink/20 bg-white/50 px-8 py-3 text-sm tracking-[0.3em] text-muted transition hover:bg-white hover:text-ink"
      >
        登出
      </button>
    </form>
  );
}
