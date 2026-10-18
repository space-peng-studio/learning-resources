/** 本地時區的 YYYY-MM-DD */
export function dateKey(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** YYYY-MM-DD 往前或往後幾天 */
export function shiftDay(key: string, days: number) {
  const [y, m, d] = key.split("-").map(Number);
  return dateKey(new Date(y, m - 1, d + days));
}

/** 台灣時間的 YYYY-MM-DD（伺服器端用，伺服器時區可能不是台灣） */
export function taipeiDate(d = new Date()) {
  return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });
}

/** 兩個 YYYY-MM-DD 相差幾天 */
export function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}
