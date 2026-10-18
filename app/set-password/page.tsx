import type { Metadata } from "next";
import AuthCard from "@/components/AuthCard";
import SetPasswordForm from "./SetPasswordForm";

export const metadata: Metadata = {
  title: "設定新密碼｜豐盛健康愛",
};

// 用臨時密碼登入後會被帶來這裡（由 proxy 控制）
export default function SetPasswordPage() {
  return (
    <AuthCard
      kicker="最後一步"
      title="設定你的新密碼"
      subtitle={
        <>
          臨時密碼只能用一次，
          <br />
          換成只有你知道的密碼吧。
        </>
      }
    >
      <SetPasswordForm />
    </AuthCard>
  );
}
