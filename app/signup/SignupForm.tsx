"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import { FormMessage, inputClass, primaryButtonClass } from "@/components/AuthCard";
import { MAX_NAME, MIN_PASSWORD } from "@/lib/authRules";

export default function SignupForm() {
  const [state, action, pending] = useActionState(signup, null);
  const next = useSearchParams().get("next") ?? "";

  return (
    <>
      <form action={action} className="mt-8 space-y-3 text-left">
        <input type="hidden" name="next" value={next} />
        <label className="block">
          <span className="mb-1.5 block pl-4 text-xs tracking-widest text-muted">我們該怎麼稱呼你？</span>
          <input
            name="name"
            required
            maxLength={MAX_NAME}
            autoComplete="nickname"
            placeholder="例如：小美"
            defaultValue={state?.values?.name}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block pl-4 text-xs tracking-widest text-muted">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            defaultValue={state?.values?.email}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block pl-4 text-xs tracking-widest text-muted">密碼（至少 {MIN_PASSWORD} 個字元）</span>
          <input
            name="password"
            type="password"
            required
            minLength={MIN_PASSWORD}
            autoComplete="new-password"
            className={inputClass}
          />
        </label>
        <FormMessage error={state?.error} />
        <button type="submit" disabled={pending} className={`${primaryButtonClass} !mt-5`}>
          {pending ? "建立中⋯" : "建立帳號"}
        </button>
      </form>
      <p className="mt-6 text-sm tracking-wider text-muted">
        已經有帳號了？
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="ml-1 text-gold underline underline-offset-4"
        >
          直接登入
        </Link>
      </p>
    </>
  );
}
