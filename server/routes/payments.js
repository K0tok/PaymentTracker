import express from "express";
import { pool } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Получить все оплаты пользователя
router.get("/", authMiddleware, async (req, res, next) => {
  try {
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
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Получить одну оплату по ID
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
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
      [req.params.id, req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Оплата не найдена" });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Создать новую оплату
router.post("/", authMiddleware, async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { address, payment_type, bank, amount, month_year, file_url } = req.body;

    if (!address || !payment_type || !bank || !amount || !month_year) {
      return res.status(400).json({ message: "Все поля обязательны" });
    }

    // Сохраняем значения в справочники (если ещё нет) и получаем ID
    const addressRes = await client.query(
      "INSERT INTO addresses (user_id, value) VALUES ($1, $2) ON CONFLICT (user_id, value) DO UPDATE SET value = EXCLUDED.value RETURNING id",
      [req.user.id, address]
    );
    const addressId = addressRes.rows[0].id;

    const paymentTypeRes = await client.query(
      "INSERT INTO payment_types (user_id, value) VALUES ($1, $2) ON CONFLICT (user_id, value) DO UPDATE SET value = EXCLUDED.value RETURNING id",
      [req.user.id, payment_type]
    );
    const paymentTypeId = paymentTypeRes.rows[0].id;

    const bankRes = await client.query(
      "INSERT INTO banks (user_id, value) VALUES ($1, $2) ON CONFLICT (user_id, value) DO UPDATE SET value = EXCLUDED.value RETURNING id",
      [req.user.id, bank]
    );
    const bankId = bankRes.rows[0].id;

    // Сохранение оплаты
    const { rows } = await client.query(
      `INSERT INTO payments (user_id, address_id, payment_type_id, bank_id, amount, month_year, file_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, addressId, paymentTypeId, bankId, amount, month_year, file_url || null]
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
      [req.user.id, addressId, paymentTypeId, bankId]
    );

    await client.query("COMMIT");

    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

// Обновить оплату
router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { address, payment_type, bank, amount, month_year, file_url } = req.body;

    // Проверка существования оплаты
    const existing = await pool.query(
      "SELECT * FROM payments WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );

    if (!existing.rows.length) {
      return res.status(404).json({ message: "Оплата не найдена" });
    }

    const { rows } = await pool.query(
      `UPDATE payments
       SET amount = COALESCE($1, amount),
           month_year = COALESCE($2, month_year),
           file_url = COALESCE($3, file_url)
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [amount, month_year, file_url, req.params.id, req.user.id]
    );

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Удалить оплату
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM payments WHERE id = $1 AND user_id = $2 RETURNING *",
      [req.params.id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Оплата не найдена" });
    }

    res.json({ message: "Оплата удалена", payment: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Загрузка файла
router.post("/upload", authMiddleware, async (req, res, next) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: "Файл не загружен" });
    }

    const file = req.files.file;
    const fileName = `${Date.now()}-${file.name}`;
    const uploadPath = `./uploads/${fileName}`;

    await file.mv(uploadPath);

    const fileUrl = `/uploads/${fileName}`;

    res.json({ file_url: fileUrl, file_name: file.name });
  } catch (err) {
    next(err);
  }
});

export default router;
