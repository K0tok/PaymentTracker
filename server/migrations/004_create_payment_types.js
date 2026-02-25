// Миграция 004: Создание таблицы типов оплат
export const up = (pgm) => {
  pgm.createTable("payment_types", {
    id: {
      type: "serial",
      primaryKey: true
    },
    user_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "cascade"
    },
    value: {
      type: "text",
      notNull: true
    },
    created_at: {
      type: "timestamptz",
      default: pgm.func("now()")
    }
  });

  pgm.createIndex("payment_types", ["user_id", "value"], { unique: true });
};

export const down = (pgm) => {
  pgm.dropTable("payment_types");
};
