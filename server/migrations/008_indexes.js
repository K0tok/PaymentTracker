// Миграция 008: Создание индексов для ускорения поиска
export const up = (pgm) => {
  // Индекс по user_id для быстрого поиска платежей пользователя
  pgm.createIndex("payments", "user_id");

  // Индекс по created_at для сортировки
  pgm.createIndex("payments", "created_at", { order: "DESC" });

  // Индекс по month_year для фильтрации по периоду
  pgm.createIndex("payments", "month_year");

  // Индекс по email для быстрого логина
  pgm.createIndex("users", "email");
};

export const down = (pgm) => {
  pgm.dropIndex("payments", "user_id");
  pgm.dropIndex("payments", "created_at");
  pgm.dropIndex("payments", "month_year");
  pgm.dropIndex("users", "email");
};
