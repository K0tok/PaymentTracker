// Миграция 007: Создание таблицы платежей
export const up = (pgm) => {
  pgm.createTable("payments", {
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
    address_id: {
      type: "integer",
      notNull: true,
      references: "addresses(id)",
      onDelete: "restrict"
    },
    payment_type_id: {
      type: "integer",
      notNull: true,
      references: "payment_types(id)",
      onDelete: "restrict"
    },
    bank_id: {
      type: "integer",
      notNull: true,
      references: "banks(id)",
      onDelete: "restrict"
    },
    amount: {
      type: "numeric",
      notNull: true
    },
    month_year: {
      type: "text",
      notNull: true
    },
    file_url: {
      type: "text",
      default: null
    },
    created_at: {
      type: "timestamptz",
      default: pgm.func("now()")
    }
  });
};

export const down = (pgm) => {
  pgm.dropTable("payments");
};
