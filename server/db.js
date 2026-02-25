import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

// Создание пула соединений
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Проверка подключения
pool.on("connect", () => {
  console.log("✅ Подключение к базе данных установлено");
});

pool.on("error", (err) => {
  console.error("❌ Ошибка подключения к базе данных:", err);
});
