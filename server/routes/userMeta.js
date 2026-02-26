import { pool } from "../db.js";

export default async function userMetaRoutes(fastify, options) {
  // Получить мета-данные пользователя (справочники + последние значения)
  fastify.get("/", { onRequest: [fastify.authenticate] }, async (request, reply) => {
    // Получаем все значения из справочников пользователя (без удалённых)
    const [addressesRes, paymentTypesRes, banksRes, metaRes] = await Promise.all([
      pool.query("SELECT id, value FROM addresses WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC", [request.user.id]),
      pool.query("SELECT id, value FROM payment_types WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC", [request.user.id]),
      pool.query("SELECT id, value FROM banks WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC", [request.user.id]),
      pool.query("SELECT * FROM user_meta WHERE user_id = $1", [request.user.id])
    ]);

    // Получаем последние выбранные значения
    const meta = metaRes.rows[0];

    // Проверяем, не удалены ли последние выбранные записи
    let lastAddressId = meta?.last_address_id || null;
    let lastPaymentTypeId = meta?.last_payment_type_id || null;
    let lastBankId = meta?.last_bank_id || null;

    // Если последний адрес удалён - сбрасываем
    if (lastAddressId && !addressesRes.rows.some(a => a.id === lastAddressId)) {
      lastAddressId = null;
    }
    // Если последний тип оплаты удалён - сбрасываем
    if (lastPaymentTypeId && !paymentTypesRes.rows.some(p => p.id === lastPaymentTypeId)) {
      lastPaymentTypeId = null;
    }
    // Если последний банк удалён - сбрасываем
    if (lastBankId && !banksRes.rows.some(b => b.id === lastBankId)) {
      lastBankId = null;
    }

    return reply.send({
      addresses: addressesRes.rows.map(row => ({ id: row.id, value: row.value })),
      payment_types: paymentTypesRes.rows.map(row => ({ id: row.id, value: row.value })),
      banks: banksRes.rows.map(row => ({ id: row.id, value: row.value })),
      last_address_id: lastAddressId,
      last_payment_type_id: lastPaymentTypeId,
      last_bank_id: lastBankId
    });
  });

  // Добавить значение в справочник
  fastify.post("/:field", { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { field } = request.params;
    const { value } = request.body;

    if (!["addresses", "payment_types", "banks"].includes(field)) {
      return reply.code(400).send({ message: "Недопустимое поле" });
    }

    const tableName = field;

    // Проверяем, есть ли такое значение (в том числе удалённое)
    const existing = await pool.query(
      `SELECT id, deleted_at FROM ${tableName} WHERE user_id = $1 AND value = $2`,
      [request.user.id, value]
    );

    if (existing.rows.length > 0) {
      const record = existing.rows[0];
      // Если запись была удалена - восстанавливаем
      if (record.deleted_at) {
        await pool.query(
          `UPDATE ${tableName} SET deleted_at = NULL WHERE id = $1`,
          [record.id]
        );
      }
      return reply.code(200).send({ id: record.id, value });
    }

    // Создаём новую запись
    const { rows } = await pool.query(
      `INSERT INTO ${tableName} (user_id, value) VALUES ($1, $2) RETURNING *`,
      [request.user.id, value]
    );

    return reply.code(201).send({ id: rows[0].id, value });
  });

  // Удалить значение из справочника (мягкое удаление)
  fastify.delete("/:field/:id", { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { field, id } = request.params;

    if (!["addresses", "payment_types", "banks"].includes(field)) {
      return reply.code(400).send({ message: "Недопустимое поле" });
    }

    const tableName = field;

    try {
      // Мягкое удаление - устанавливаем deleted_at
      const result = await pool.query(
        `UPDATE ${tableName} SET deleted_at = now() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
        [id, request.user.id]
      );

      if (result.rowCount === 0) {
        return reply.code(404).send({ message: "Запись не найдена" });
      }

      return reply.send({ message: "Удалено" });
    } catch (err) {
      console.log('Ошибка удаления:', err.code, err.message);
      return reply.code(500).send({ message: "Ошибка удаления" });
    }
  });
}
