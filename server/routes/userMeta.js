import express from "express";
import { pool } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Получить мета-данные пользователя (справочники + последние значения)
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    // Получаем все значения из справочников пользователя
    const [addressesRes, paymentTypesRes, banksRes, metaRes] = await Promise.all([
      pool.query("SELECT id, value FROM addresses WHERE user_id = $1 ORDER BY created_at DESC", [req.user.id]),
      pool.query("SELECT id, value FROM payment_types WHERE user_id = $1 ORDER BY created_at DESC", [req.user.id]),
      pool.query("SELECT id, value FROM banks WHERE user_id = $1 ORDER BY created_at DESC", [req.user.id]),
      pool.query("SELECT * FROM user_meta WHERE user_id = $1", [req.user.id])
    ]);

    // Получаем последние выбранные значения
    const meta = metaRes.rows[0];

    res.json({
      addresses: addressesRes.rows.map(row => ({ id: row.id, value: row.value })),
      payment_types: paymentTypesRes.rows.map(row => ({ id: row.id, value: row.value })),
      banks: banksRes.rows.map(row => ({ id: row.id, value: row.value })),
      last_address_id: meta?.last_address_id || null,
      last_payment_type_id: meta?.last_payment_type_id || null,
      last_bank_id: meta?.last_bank_id || null
    });
  } catch (err) {
    next(err);
  }
});

// Добавить значение в справочник
router.post("/:field", authMiddleware, async (req, res, next) => {
  try {
    const { field } = req.params;
    const { value } = req.body;

    if (!["addresses", "payment_types", "banks"].includes(field)) {
      return res.status(400).json({ message: "Недопустимое поле" });
    }

    const tableName = field;

    const { rows } = await pool.query(
      `INSERT INTO ${tableName} (user_id, value) VALUES ($1, $2) ON CONFLICT (user_id, value) DO NOTHING RETURNING *`,
      [req.user.id, value]
    );

    res.status(rows.length ? 201 : 200).json({ id: rows[0]?.id, value });
  } catch (err) {
    next(err);
  }
});

export default router;
