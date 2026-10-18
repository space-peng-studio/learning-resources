// 未登入時的試用提示：可以用，只是不會被記錄
export default function GuestNotice({ children, loginHref }: { children: React.ReactNode; loginHref: string }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 rounded-2xl border border-gold/30 bg-white/60 px-5 py-4 text-center text-sm leading-relaxed tracking-wide text-ink/80 backdrop-blur sm:flex-row sm:justify-between sm:text-left">
      <p>
        <span className="mr-2 rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">試用中</span>
        {children}
      </p>
      <a
        href={loginHref}
        className="shrink-0 rounded-full bg-ink px-5 py-2 text-sm tracking-[0.2em] text-white transition hover:-translate-y-0.5"
      >
        登入記錄
      </a>
    </div>
  );
}
