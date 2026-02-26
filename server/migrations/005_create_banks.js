// Миграция 005: Создание таблицы банков
export const up = (pgm) => {
  pgm.createTable("banks", {
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

  pgm.createIndex("banks", ["user_id", "value"], { unique: true });
};

export const down = (pgm) => {
  pgm.dropTable("banks");
};
