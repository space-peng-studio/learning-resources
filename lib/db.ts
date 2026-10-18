import "server-only";
import mongoose from "mongoose";

// 開發模式下熱更新會重新執行模組，把連線快取在 global 上避免重複建立連線
const globalForMongoose = globalThis as unknown as {
  mongooseConn?: Promise<typeof mongoose>;
};

export function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("缺少環境變數 MONGODB_URI");
  }

  if (!globalForMongoose.mongooseConn) {
    const dbName = process.env.MONGODB_DB;
    globalForMongoose.mongooseConn = mongoose
      // 有設定 MONGODB_DB 就用它，沒有就用連線字串裡寫的資料庫名稱
      // 連不上時 5 秒就放棄（預設約 30 秒），頁面能較快改顯示「系統暫時忙碌」
      .connect(uri, { serverSelectionTimeoutMS: 5000, ...(dbName ? { dbName } : {}) })
      .catch((err) => {
        // 連線失敗時清掉快取，下次請求才會重試
        globalForMongoose.mongooseConn = undefined;
        throw err;
      });
  }
  return globalForMongoose.mongooseConn;
}
