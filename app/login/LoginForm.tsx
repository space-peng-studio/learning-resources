"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { FormMessage, inputClass, primaryButtonClass } from "@/components/AuthCard";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  const next = useSearchParams().get("next") ?? "";

  return (
    <>
      <form action={action} className="mt-8 space-y-3 text-left">
        <input type="hidden" name="next" value={next} />
        <label className="block">
          <span className="sr-only">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            defaultValue={state?.values?.email}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="sr-only">密碼</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="密碼"
            className={inputClass}
          />
        </label>
        <FormMessage error={state?.error} />
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "登入中⋯" : "登入"}
        </button>
      </form>
      <p className="mt-6 text-sm tracking-wider text-muted">
        第一次來？
        <Link
          href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
          className="ml-1 text-gold underline underline-offset-4"
        >
          建立帳號
        </Link>
      </p>
    </>
  );
}
