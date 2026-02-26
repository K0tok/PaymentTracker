// Миграция 003: Создание таблицы адресов
export const up = (pgm) => {
  pgm.createTable("addresses", {
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
    },
    deleted_at: {
      type: "timestamptz",
      default: null
    }
  });

  pgm.createIndex("addresses", ["user_id", "value"], { unique: true });
};

export const down = (pgm) => {
  pgm.dropTable("addresses");
};
