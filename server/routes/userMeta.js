import { pool } from "../db.js";

export default async function userMetaRoutes(fastify, options) {
  // Получить мета-данные пользователя (справочники + последние значения)
  fastify.get("/", { onRequest: [fastify.authenticate] }, async (request, reply) => {
    // Получаем все значения из справочников пользователя
    const [addressesRes, paymentTypesRes, banksRes, metaRes] = await Promise.all([
      pool.query("SELECT id, value FROM addresses WHERE user_id = $1 ORDER BY created_at DESC", [request.user.id]),
      pool.query("SELECT id, value FROM payment_types WHERE user_id = $1 ORDER BY created_at DESC", [request.user.id]),
      pool.query("SELECT id, value FROM banks WHERE user_id = $1 ORDER BY created_at DESC", [request.user.id]),
      pool.query("SELECT * FROM user_meta WHERE user_id = $1", [request.user.id])
    ]);

    // Получаем последние выбранные значения
    const meta = metaRes.rows[0];

    return reply.send({
      addresses: addressesRes.rows.map(row => ({ id: row.id, value: row.value })),
      payment_types: paymentTypesRes.rows.map(row => ({ id: row.id, value: row.value })),
      banks: banksRes.rows.map(row => ({ id: row.id, value: row.value })),
      last_address_id: meta?.last_address_id || null,
      last_payment_type_id: meta?.last_payment_type_id || null,
      last_bank_id: meta?.last_bank_id || null
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

    const { rows } = await pool.query(
      `INSERT INTO ${tableName} (user_id, value) VALUES ($1, $2) ON CONFLICT (user_id, value) DO NOTHING RETURNING *`,
      [request.user.id, value]
    );

    return reply.code(rows.length ? 201 : 200).send({ id: rows[0]?.id, value });
  });
}
