import type { Metadata } from "next";
import { Suspense } from "react";
import AuthCard, { LINE_URL } from "@/components/AuthCard";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "登入｜豐盛健康愛",
  description: "金錢靈氣陪伴你的日常。",
};

export default function LoginPage() {
  return (
    <AuthCard
      kicker="學員專屬"
      title={
        <>
          歡迎回到<span className="text-aura">豐盛</span>
        </>
      }
      subtitle="登入後，你的每日練習都在這裡等你。"
    >
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-6 border-t border-ink/10 pt-5 text-xs leading-relaxed tracking-wider text-muted">
        忘記密碼了嗎？請透過
        <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="mx-1 text-gold underline underline-offset-4">
          LINE 官方帳號
        </a>
        告訴我們，
        <br />
        我們會協助你重新設定。
      </p>
    </AuthCard>
  );
}
