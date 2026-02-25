// Миграция 006: Создание таблицы мета-данных пользователя
// Хранит последние выбранные значения для автозаполнения формы
export const up = (pgm) => {
  pgm.createTable("user_meta", {
    user_id: {
      type: "integer",
      notNull: true,
      primaryKey: true,
      references: "users(id)",
      onDelete: "cascade"
    },
    last_address_id: {
      type: "integer",
      references: "addresses(id)",
      onDelete: "set null"
    },
    last_payment_type_id: {
      type: "integer",
      references: "payment_types(id)",
      onDelete: "set null"
    },
    last_bank_id: {
      type: "integer",
      references: "banks(id)",
      onDelete: "set null"
    },
    updated_at: {
      type: "timestamptz",
      default: pgm.func("now()")
    }
  });
};

export const down = (pgm) => {
  pgm.dropTable("user_meta");
};
