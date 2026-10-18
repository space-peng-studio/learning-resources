import type { Metadata } from "next";
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

// 中文字型檔很大，不預先載入，避免拖慢首屏
const notoSans = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  preload: false,
});

const notoSerif = Noto_Serif_TC({
  variable: "--font-noto-serif-tc",
  preload: false,
});

export const metadata: Metadata = {
  title: "豐盛健康愛",
  description: "金錢靈氣陪伴你的小日常",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      className={`${notoSans.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div aria-hidden className="page-bg" />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
