import Image from "next/image";

const iconProps = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  className: "size-5 shrink-0",
};

const contacts = [
  {
    label: "LINE 官方帳號",
    href: "https://line.me/R/ti/p/@104onvjd",
    icon: (
      <svg {...iconProps} fill="currentColor">
        <path d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.5 1.1-.5 5.9-3.5 8-5.9 1.4-1.6 2-3.2 2-4.9C22 6.6 17.5 3 12 3Z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/healthy.theta/",
    icon: (
      <svg {...iconProps} fill="none" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "粉絲專頁",
    href: "https://www.facebook.com/healthy.theta",
    icon: (
      <svg {...iconProps} fill="currentColor">
        <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H7.9v3h2.6V21h3Z" />
      </svg>
    ),
  },
  {
    label: "官方網站",
    href: "https://lightofcreator14913.com/",
    icon: (
      <svg {...iconProps} fill="none" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" />
      </svg>
    ),
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-[#f3efea]/80 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 pt-14 pb-8 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Image src="/logo.png" alt="" width={56} height={56} className="size-12 sm:size-14" />
              <span className="font-serif text-lg tracking-[0.3em] text-ink sm:text-xl">
                豐盛健康愛
              </span>
              <span aria-hidden className="h-5 w-px bg-ink/20" />
              <span className="font-serif text-base tracking-[0.3em] text-[#4b4368] sm:text-xl">
                打造自己的豐盛
              </span>
            </div>
            <p className="mt-8 break-keep font-serif text-xl leading-relaxed tracking-wider text-ink/80 sm:text-2xl">
              把溫柔的目光留給自己，
              <br />
              我們陪你一磚一瓦，蓋出你最舒適的樣貌。
            </p>
          </div>

          <div className="md:w-[26rem]">
            <p className="text-sm tracking-[0.4em] text-gold">聯絡我們</p>
            <ul className="mt-5 grid grid-cols-2 gap-3">
              {contacts.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-full border border-ink/12 bg-white/50 px-5 py-3.5 text-sm text-ink transition hover:-translate-y-0.5 hover:border-ink/25 hover:bg-white/90 sm:text-base"
                  >
                    {c.icon}
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-ink/10 pt-6 text-xs tracking-widest text-muted sm:flex-row sm:justify-between sm:text-sm">
          <p>© 2026 豐盛健康愛　版權所有</p>
          <p>本站內容僅供自我覺察參考，不構成任何財務建議。</p>
        </div>
      </div>
    </footer>
  );
}
