import { pool } from "../db.js";

export default async function paymentRoutes(fastify, options) {
  // Получить все оплаты пользователя
  fastify.get("/", { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { rows } = await pool.query(
      `SELECT
        p.id,
        p.amount,
        p.month_year,
        p.file_url,
        p.created_at,
        a.value as address,
        pt.value as payment_type,
        b.value as bank
       FROM payments p
       JOIN addresses a ON p.address_id = a.id
       JOIN payment_types pt ON p.payment_type_id = pt.id
       JOIN banks b ON p.bank_id = b.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [request.user.id]
    );

    return reply.send(rows);
  });

  // Получить одну оплату по ID
  fastify.get("/:id", { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { rows } = await pool.query(
      `SELECT
        p.id,
        p.amount,
        p.month_year,
        p.file_url,
        p.created_at,
        a.value as address,
        pt.value as payment_type,
        b.value as bank
       FROM payments p
       JOIN addresses a ON p.address_id = a.id
       JOIN payment_types pt ON p.payment_type_id = pt.id
       JOIN banks b ON p.bank_id = b.id
       WHERE p.id = $1 AND p.user_id = $2`,
      [request.params.id, request.user.id]
    );

    if (!rows.length) {
      return reply.code(404).send({ message: "Оплата не найдена" });
    }

    return reply.send(rows[0]);
  });

  // Создать новую оплату
  fastify.post("/", { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { address, payment_type, bank, amount, month_year, file_url } = request.body;

      if (!address || !payment_type || !bank || !amount || !month_year) {
        return reply.code(400).send({ message: "Все поля обязательны" });
      }

      // Сохраняем значения в справочники (если ещё нет) и получаем ID
      const addressRes = await client.query(
        "INSERT INTO addresses (user_id, value) VALUES ($1, $2) ON CONFLICT (user_id, value) DO UPDATE SET value = EXCLUDED.value RETURNING id",
        [request.user.id, address]
      );
      const addressId = addressRes.rows[0].id;

      const paymentTypeRes = await client.query(
        "INSERT INTO payment_types (user_id, value) VALUES ($1, $2) ON CONFLICT (user_id, value) DO UPDATE SET value = EXCLUDED.value RETURNING id",
        [request.user.id, payment_type]
      );
      const paymentTypeId = paymentTypeRes.rows[0].id;

      const bankRes = await client.query(
        "INSERT INTO banks (user_id, value) VALUES ($1, $2) ON CONFLICT (user_id, value) DO UPDATE SET value = EXCLUDED.value RETURNING id",
        [request.user.id, bank]
      );
      const bankId = bankRes.rows[0].id;

      // Сохранение оплаты
      const { rows } = await client.query(
        `INSERT INTO payments (user_id, address_id, payment_type_id, bank_id, amount, month_year, file_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [request.user.id, addressId, paymentTypeId, bankId, amount, month_year, file_url || null]
      );

      // Сохраняем последние выбранные значения в user_meta
      await client.query(
        `INSERT INTO user_meta (user_id, last_address_id, last_payment_type_id, last_bank_id)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id)
         DO UPDATE SET
           last_address_id = $2,
           last_payment_type_id = $3,
           last_bank_id = $4,
           updated_at = now()`,
        [request.user.id, addressId, paymentTypeId, bankId]
      );

      await client.query("COMMIT");

      return reply.code(201).send(rows[0]);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  });

  // Обновить оплату
  fastify.put("/:id", { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { address, payment_type, bank, amount, month_year, file_url } = request.body;

    // Проверка существования оплаты
    const existing = await pool.query(
      "SELECT * FROM payments WHERE id = $1 AND user_id = $2",
      [request.params.id, request.user.id]
    );

    if (!existing.rows.length) {
      return reply.code(404).send({ message: "Оплата не найдена" });
    }

    const { rows } = await pool.query(
      `UPDATE payments
       SET amount = COALESCE($1, amount),
           month_year = COALESCE($2, month_year),
           file_url = COALESCE($3, file_url)
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [amount, month_year, file_url, request.params.id, request.user.id]
    );

    return reply.send(rows[0]);
  });

  // Удалить оплату
  fastify.delete("/:id", { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const result = await pool.query(
      "DELETE FROM payments WHERE id = $1 AND user_id = $2 RETURNING *",
      [request.params.id, request.user.id]
    );

    if (!result.rows.length) {
      return reply.code(404).send({ message: "Оплата не найдена" });
    }

    return reply.send({ message: "Оплата удалена", payment: result.rows[0] });
  });

  // Загрузка файла
  fastify.post("/upload", { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const data = await request.file();

    if (!data) {
      return reply.code(400).send({ message: "Файл не загружен" });
    }

    const fileName = `${Date.now()}-${data.filename}`;
    const uploadPath = `./uploads/${fileName}`;

    await data.toFile(uploadPath);

    const fileUrl = `/uploads/${fileName}`;

    return reply.send({ file_url: fileUrl, file_name: data.filename });
  });
}
