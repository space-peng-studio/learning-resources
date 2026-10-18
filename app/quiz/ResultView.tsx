import EnergyDashboard from "@/components/EnergyDashboard";
import { diagnose, evaluate, stages, type Scores } from "@/lib/moneyMap";

// 測驗結果：修行位置與階段地圖 → 心聲與診斷 → 能量儀表板（成長折線圖在 QuizApp 接在後面）

export default function ResultView({ scores, previous }: { scores: Scores; previous?: Scores }) {
  const { stage } = evaluate(scores);
  const d = diagnose(scores);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_40px_80px_-50px_rgb(94_75_107/0.5)] backdrop-blur sm:p-10">
        <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose via-lavender to-[#8fa2cb]" />

        {/* 修行位置與階段地圖 */}
        <p className="text-center font-serif text-xs tracking-[0.5em] text-gold">你的結果</p>
        <h2 className="mt-3 text-balance break-keep text-center font-serif text-2xl font-bold tracking-wide text-ink sm:text-3xl">
          你現在的金錢能量在這個階段
        </h2>
        <ol className="mt-8 grid grid-cols-4 gap-2 sm:gap-3">
          {stages.map((s) => {
            const current = s.key === stage.key;
            return (
              <li
                key={s.key}
                aria-current={current ? "step" : undefined}
                className={`relative rounded-2xl px-1 py-3 text-center transition sm:px-3 sm:py-5 ${
                  current
                    ? "-translate-y-1 border-[1.5px] border-transparent shadow-[0_18px_36px_-20px_rgb(94_75_107/0.6)] [background:linear-gradient(#fff,#fff)_padding-box,linear-gradient(120deg,#e9b7ba,#bba5c6,#8fa2cb)_border-box]"
                    : "border border-ink/8 bg-white opacity-45"
                }`}
              >
                {current && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2 py-0.5 text-[10px] tracking-wider text-white">
                    你在這裡
                  </span>
                )}
                <span aria-hidden className="block text-xl sm:text-3xl">
                  {s.emoji}
                </span>
                <span
                  className={`mt-1 block font-serif text-xs font-bold tracking-wider sm:text-base ${
                    current ? "text-[#5e4b6b]" : "text-ink"
                  }`}
                >
                  {s.name}
                </span>
                <span className="mt-0.5 block text-[10px] text-muted sm:text-xs">{s.short}</span>
              </li>
            );
          })}
        </ol>
        <p className="mt-5 text-center text-xs tracking-widest text-muted sm:text-sm">
          這張地圖是用來定位的，不是用來排名的。
        </p>

        {/* 心聲與診斷 */}
        <div className="mt-9 border-t border-ink/8 pt-8">
          <p className="border-l-2 border-lavender pl-5 font-serif text-sm italic leading-loose text-ink/80 sm:text-base">
            {d.painQuote}
          </p>
          <h3 className="mt-6 text-balance break-keep font-serif text-xl font-bold leading-snug text-[#5e4b6b] sm:text-2xl">
            {d.diagnosis}
          </h3>
          <p className="mt-3 text-sm leading-loose text-muted sm:text-[15px]">{d.insight}</p>
        </div>
      </section>

      <EnergyDashboard scores={scores} previous={previous} />
    </div>
  );
}
