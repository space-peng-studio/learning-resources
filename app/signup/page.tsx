import type { Metadata } from "next";
import { Suspense } from "react";
import AuthCard from "@/components/AuthCard";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "建立帳號｜豐盛健康愛",
  description: "金錢靈氣陪伴你的日常。",
};

export default function SignupPage() {
  return (
    <AuthCard
      kicker="第一次見面"
      title={
        <>
          很高興<span className="text-aura">遇見你</span>
        </>
      }
      subtitle="留下你的名字，我們會記得你。"
    >
      <Suspense>
        <SignupForm />
      </Suspense>
    </AuthCard>
  );
}
