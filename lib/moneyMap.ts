// 金錢靈氣修行地圖 2.1 —— 測驗題目、階段判定、各階段練習項目
// 來源：大天使 Peggie《金錢靈氣修行地圖_2_1.pdf》

export type Dimension = "emotion" | "belief" | "action" | "asset";
export type Scores = Record<Dimension, number>;
export type StageKey = "seed" | "growth" | "abundance" | "master";

export const questions: {
  key: Dimension;
  label: string;
  title: string;
  options: string[];
}[] = [
  {
    key: "emotion",
    label: "情緒",
    title: "面對金錢時，你第一時間最常浮現的感受？",
    options: ["充滿恐懼", "焦慮緊張", "麻木迴避", "平靜無感", "好奇開放", "感謝喜悅"],
  },
  {
    key: "belief",
    label: "信念",
    title: "你覺得自己與金錢的深層關係是？",
    options: ["我不配有錢", "錢很難賺", "有點懷疑", "中立不確定", "錢會找我", "我值得豐盛"],
  },
  {
    key: "action",
    label: "行為",
    title: "日常生活裡，你有做理財行動嗎？",
    options: ["完全沒做", "偶爾記帳", "有存錢習慣", "有投資計畫", "自動化運作中", "每月穩定複盤"],
  },
  {
    key: "asset",
    label: "資產",
    title: "你的淨資產狀態大約落在哪裡？",
    options: ["負債狀態", "0–30 萬", "30–100 萬", "100–500 萬", "500–1000 萬", "1000 萬以上"],
  },
];

export const dimensionLabel: Record<Dimension, string> = {
  emotion: "情緒",
  belief: "信念",
  action: "行為",
  asset: "資產",
};

// 決定階段的三個面向（資產只是參考座標，不參與判定）
export const stageDimensions: Dimension[] = ["emotion", "belief", "action"];

export type Frequency = "daily" | "once" | "regular" | "monthly" | "quarterly" | "yearly";
export type Tag = "靈性" | "顯化" | "理財" | "意識" | "空間" | "AI" | "使命" | "傳承";

export type Practice = {
  id: string;
  text: string;
  tag: Tag;
  frequency: Frequency;
};

export type Stage = {
  key: StageKey;
  name: string;
  color: string;
  assetRef: string;
  emoji: string;
  short: string; // 階段地圖上的短標語
  headline: string;
  focus: string;
  required: Practice[];
  suggested: Practice[];
  upgrade: { label: string; text: string };
  core: string;
};

export const stages: Stage[] = [
  {
    key: "seed",
    name: "種子期",
    color: "#6f9a5b",
    assetRef: "負債 → 50 萬",
    emoji: "🌱",
    short: "打底扎根",
    headline: "先讓修行活下來",
    focus: "清理恐懼、開第一個帳戶",
    required: [
      { id: "seed-r1", text: "每天睡前傳送靈氣給當天每筆金錢往來，說「謝謝你，祝福你」", tag: "靈性", frequency: "daily" },
      { id: "seed-r2", text: "製作並啟動金錢靈氣盒，寫下 1–3 個現在式意圖", tag: "顯化", frequency: "once" },
      { id: "seed-r3", text: "完成個人資產負債表，看清楚自己的起點數字", tag: "理財", frequency: "once" },
      { id: "seed-r4", text: "開設一個帳戶，本月轉入任何金額（哪怕 500 元）", tag: "理財", frequency: "once" },
      { id: "seed-r5", text: "停止說「我好窮／錢很難來」，換成「錢正在支持我」", tag: "意識", frequency: "daily" },
    ],
    suggested: [
      { id: "seed-s1", text: "美元符號（$）冥想，從每天 3 分鐘開始", tag: "靈性", frequency: "daily" },
      { id: "seed-s2", text: "做一次金錢靈氣自我治療，清理身體層面的恐懼阻塞", tag: "靈性", frequency: "once" },
      { id: "seed-s3", text: "清理家中一個雜亂角落（斷捨離），讓能量開始流動", tag: "空間", frequency: "once" },
      { id: "seed-s4", text: "用 AI×五行查看自己的金錢能量弱點與避雷提醒", tag: "AI", frequency: "once" },
      { id: "seed-s5", text: "為一張帳單傳送財務祝福，練習「給出去」的感覺", tag: "靈性", frequency: "once" },
    ],
    upgrade: {
      label: "升級訊號",
      text: "情緒穩定達 3 分以上、帳戶開始正成長、修行累積滿 21 天（斷了一天沒關係，接著數就好，不用歸零重來）",
    },
    core: "一階工具為主——傳送靈氣給金錢往來、金錢靈氣盒、個人資產負債表",
  },
  {
    key: "growth",
    name: "成長期",
    color: "#4f7fa6",
    assetRef: "50 – 200 萬",
    emoji: "🌿",
    short: "建立結構",
    headline: "給靈氣一個現實結構",
    focus: "分離帳戶、自動轉帳 10%",
    required: [
      { id: "growth-r1", text: "每天美元符號（$）冥想 5 分鐘，已成日常習慣", tag: "靈性", frequency: "daily" },
      { id: "growth-r2", text: "設定薪資自動分流：投資帳戶 10%＋夢想帳戶 10%", tag: "理財", frequency: "once" },
      { id: "growth-r3", text: "開始每月定期定額投資（習慣比金額重要）", tag: "理財", frequency: "monthly" },
      { id: "growth-r4", text: "每月更新一次資產負債表，追蹤數字成長", tag: "理財", frequency: "monthly" },
      { id: "growth-r5", text: "做歐元符號（€）冥想，穩定金錢基底頻率", tag: "靈性", frequency: "daily" },
      { id: "growth-r6", text: "書寫金錢靈氣小卡，搭配五個高頻狀態注入意圖", tag: "顯化", frequency: "once" },
    ],
    suggested: [
      { id: "growth-s1", text: "做顯化符號（φ）操作，把大目標放入靈氣盒", tag: "顯化", frequency: "once" },
      { id: "growth-s2", text: "完成家中印度風水九宮格定位，清理東南方（金錢區）", tag: "空間", frequency: "once" },
      { id: "growth-s3", text: "每月做一次世界金錢冥想（能量貢獻）", tag: "靈性", frequency: "monthly" },
      { id: "growth-s4", text: "用 72 法則計算現有投資翻倍年數，寫在看得到的地方", tag: "理財", frequency: "once" },
      { id: "growth-s5", text: "做黃金金字塔清理，處理更深層的業力阻塞", tag: "靈性", frequency: "once" },
      { id: "growth-s6", text: "流動練習：給小費／捐款／消費不愧疚，感受給與收的循環", tag: "靈性", frequency: "daily" },
    ],
    upgrade: {
      label: "升級訊號",
      text: "分離帳戶自動運作、情緒達 4–5 分、資產穩定跨越 100 萬、修行從「要提醒」變成「自然而然」",
    },
    core: "加入二階符號，以及「豐盛自動理財」的分離帳戶與定期定額",
  },
  {
    key: "abundance",
    name: "豐盛期",
    color: "#c07a3e",
    assetRef: "200 – 1000 萬",
    emoji: "🌳",
    short: "複利流動",
    headline: "讓複利開始工作",
    focus: "世界冥想、72 法則計算",
    required: [
      { id: "abundance-r1", text: "每天冥想＋主動傳靈氣給投資帳戶，強化金錢磁鐵場", tag: "靈性", frequency: "daily" },
      { id: "abundance-r2", text: "每季做一次黃金金字塔深層業力清理", tag: "靈性", frequency: "quarterly" },
      { id: "abundance-r3", text: "資產配置完成三格比例：現金備用金／長期投資／夢想目標", tag: "理財", frequency: "once" },
      { id: "abundance-r4", text: "每月穩定複盤：數字＋能量狀態一起看，兩者都要追蹤", tag: "理財", frequency: "monthly" },
      { id: "abundance-r5", text: "定期做世界金錢冥想，感受豐盛從自己向外流動", tag: "靈性", frequency: "regular" },
    ],
    suggested: [
      { id: "abundance-s1", text: "完成印度風水全屋九宮格調整，各方位顏色與功能到位", tag: "空間", frequency: "once" },
      { id: "abundance-s2", text: "用 72 法則設定 10 年翻倍目標，倒推年化報酬率", tag: "理財", frequency: "once" },
      { id: "abundance-s3", text: "開始探索第一條被動收入方向（副業／房租／股息）", tag: "理財", frequency: "once" },
      { id: "abundance-s4", text: "使用三階肯定符號（$∞）搭配肯定句，設定新豐盛意圖場", tag: "靈性", frequency: "daily" },
      { id: "abundance-s5", text: "開始幫家人／朋友做金錢靈氣遠距療癒或財務祝福", tag: "靈性", frequency: "once" },
    ],
    upgrade: {
      label: "升級訊號",
      text: "情緒穩定在 5–6 分、有被動收入補充主動收入、開始問「我想用金錢做什麼」這類使命問題",
    },
    core: "加入三階符號、印度風水，以及投資情緒清理",
  },
  {
    key: "master",
    name: "宗師期",
    color: "#7d68ad",
    assetRef: "1000 萬以上（真正門檻是意識與使命）",
    emoji: "✨",
    short: "能量轉化",
    headline: "成為金錢能量轉化器",
    focus: "傳承、使命、被動收入",
    required: [
      { id: "master-r1", text: "每天世界冥想：祝福所有與金錢掙扎的人，成為金錢光的載體", tag: "靈性", frequency: "daily" },
      { id: "master-r2", text: "使用三階符號進行深層淨化，面對最深層的內在阻抗", tag: "靈性", frequency: "once" },
      { id: "master-r3", text: "對金錢與人生全盤負責：財務問題＝人生有需要改變的地方", tag: "意識", frequency: "daily" },
      { id: "master-r4", text: "建立至少一條穩定被動收入，讓金錢持續流動不停止", tag: "理財", frequency: "once" },
      { id: "master-r5", text: "每年重新寫：「我想用金錢做什麼？」對齊靈魂天命", tag: "使命", frequency: "yearly" },
    ],
    suggested: [
      { id: "master-s1", text: "開始教學或分享金錢靈氣，讓能量透過你流向更多人", tag: "傳承", frequency: "once" },
      { id: "master-s2", text: "制定財富傳承計畫（家人／下一代／公益方向）", tag: "理財", frequency: "once" },
      { id: "master-s3", text: "靜坐 10 分鐘問：「如果金錢不再是問題，我會用它做什麼？」", tag: "使命", frequency: "daily" },
      { id: "master-s4", text: "檢視金錢是否真正對齊靈魂使命，不對齊的部分勇敢調整", tag: "使命", frequency: "once" },
      { id: "master-s5", text: "持續進行世界金錢冥想，為地球的金錢能量轉化做貢獻", tag: "靈性", frequency: "daily" },
    ],
    upgrade: {
      label: "持續精進",
      text: "金錢靈氣不再是「我的工具」，而是「流過你的能量」——你就是那道光",
    },
    core: "工具已內化，重點轉向世界冥想、傳承與使命",
  },
];

export const frequencyLabel: Record<Frequency, string> = {
  daily: "每日",
  once: "一次",
  regular: "定期",
  monthly: "每月",
  quarterly: "每季",
  yearly: "每年",
};

// 單一面向的分數對應到第幾階段：1–2 種子、3–4 成長、5 豐盛、6 宗師
function levelOf(score: number) {
  if (score <= 2) return 0;
  if (score <= 4) return 1;
  if (score === 5) return 2;
  return 3;
}

// 以情緒、信念、行為中「分數最低的那一維」定位階段
export function evaluate(scores: Scores) {
  const min = Math.min(...stageDimensions.map((d) => scores[d]));
  const lowest = stageDimensions.filter((d) => scores[d] === min);
  return { stage: stages[levelOf(min)], lowest };
}

export function stageByKey(key: StageKey) {
  return stages.find((s) => s.key === key)!;
}

export type Diagnosis = {
  painQuote: string;
  diagnosis: string;
  insight: string;
  prescription: string;
};

/**
 * 心聲與診斷：沿用《學習地圖》測驗網站與老師討論好的四種類型與原文。
 * 以情緒、信念、行為的平均（意識分數）和資產比較來判斷。
 */
export function diagnose(scores: Scores): Diagnosis {
  const conscious = (scores.emotion + scores.belief + scores.action) / 3;
  const asset = scores.asset;

  // 靈性先鋒型：心靈富足，但現實負債／起步
  if (conscious - asset >= 1.5) {
    return {
      painQuote: "「明明學了很多吸引力法則、懂感恩、心態樂觀，為什麼現實存摺還是常被卡債或帳單追著跑？」",
      diagnosis: "你的靈性頻率已走在前面，但能量缺乏物質容器落地。",
      insight:
        "你擁有非常強大的配得感與顯化天賦，這很珍貴。但光有高頻心態，若沒有給它一個三維世界的管道，能量就像水蒸氣一樣散掉了。負債不是失敗，只是過去留下的客觀舊印記。",
      prescription:
        "「建立現實骨架」——本期先不用花時間冥想「我值不值得」，而是勇敢打開個人資產負債表看清數字，開一個專屬帳戶存入第一筆錢，為能量搭起錨定點。",
    };
  }
  // 守護實幹型：資產高，但心態焦慮緊繃
  if (asset - conscious >= 1.5) {
    return {
      painQuote: "「存款幾百萬、工作也不錯，但看帳單、看到市場波動，心臟依然狂跳、習慣性感到匱乏。」",
      diagnosis: "你的資產走在前面，但心靈神經系統還在為過去緊張。",
      insight:
        "你在三維物質世界非常努力且有實力，但你的身體記憶還停留在過去匱乏的創傷裡。存摺數字滿了，但內在的安全感容器漏水了。",
      prescription:
        "「安頓緊繃神經」——你不需要更拼命賺錢，睡前對今天的金錢往來說「謝謝你，祝福你」，練習信任自己配得上這份豐盛。",
    };
  }
  // 破土萌芽型：心智與資產皆在低位
  if (conscious <= 2.6 && asset <= 2) {
    return {
      painQuote: "「被生活開銷追著跑，一提到錢只有恐懼與無力感，完全不知道從何著手。」",
      diagnosis: "種子正在破土，晚出發不是落後，路剛好從這裡開始。",
      insight:
        "你現在的無力感很真實。請不要急著追求大顯化或賺大錢，當前唯一的目標不是「暴富」，而是「先在心底長出第一個微小而堅定的安全感」。",
      prescription:
        "「替換匱乏語言」——停止在心裡默念「我好窮、錢很難賺」，換成「宇宙正在支持我」；從每個月存入一小筆固定金額開始，建立對現實的掌控感。",
    };
  }
  // 順流豐盛型：四維相對平衡
  return {
    painQuote: "「有儲蓄有投資、心態平靜，但好像卡在一個平原期，不知道下一個台階在哪裡。」",
    diagnosis: "根基已扎實，你正站在『從個人走向循環』的擴張點。",
    insight:
      "你的理財骨架與心念都已就位。此時的瓶頸不是技術，而是格局——從「為自己累積財富」跨入「讓財富向外流動、創造更大價值」。",
    prescription: "「啟動複利與世界連結」——在日常消費或給出金錢時放下得失心，練習全然祝福，讓金錢成為流過你的溫暖能量。",
  };
}
