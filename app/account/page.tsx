import type { Metadata } from "next";
import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import { requireUser } from "@/lib/auth";
import { LogoutButton, NameForm, PasswordForm } from "./AccountForms";
import { orBusy } from "@/components/orBusy";
import BusyNotice from "@/components/BusyNotice";

export const metadata: Metadata = {
  title: "帳號設定｜豐盛健康愛",
};

async function AccountPanel() {
  return orBusy(async () => {
    const user = await requireUser();
    return (
      <div className="space-y-5">
        <p className="text-center text-sm tracking-wider text-muted">登入信箱：{user.email}</p>
        <NameForm name={user.name} />
        <PasswordForm />
        <div className="pt-4">
          <LogoutButton />
        </div>
      </div>
    );
  }, <BusyNotice />);
}

export default function AccountPage() {
  return (
    <div className="relative flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-20 pt-6 sm:px-8 sm:pt-10">
        <h1 className="text-center font-serif text-3xl font-bold tracking-[0.2em] text-ink">帳號設定</h1>
        <div className="mt-8">
          <Suspense fallback={<div className="h-96" />}>
            <AccountPanel />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
