// Миграция 001: Включение расширения pgcrypto для генерации UUID
export const up = (pgm) => {
  pgm.createExtension("pgcrypto", { ifNotExists: true });
};

export const down = (pgm) => {
  pgm.dropExtension("pgcrypto", { ifExists: true });
};
