// Миграция 002: Создание таблицы пользователей
export const up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "serial",
      primaryKey: true
    },
    email: {
      type: "text",
      notNull: true,
      unique: true
    },
    password: {
      type: "text",
      notNull: true
    },
    created_at: {
      type: "timestamptz",
      default: pgm.func("now()")
    }
  });
};

export const down = (pgm) => {
  pgm.dropTable("users");
};
