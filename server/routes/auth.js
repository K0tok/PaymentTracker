import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();

// Регистрация нового пользователя
router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email и пароль обязательны" });
    }

    // Проверка существующего пользователя
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Пользователь уже существует" });
    }

    // Хэширование пароля
    const hash = await bcrypt.hash(password, 10);

    // Создание пользователя
    const { rows } = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hash]
    );

    res.status(201).json({ id: rows[0].id, email: rows[0].email });
  } catch (err) {
    next(err);
  }
});

// Логин пользователя
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email и пароль обязательны" });
    }

    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (!rows.length) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ message: "Неверный пароль" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "30d"
    });

    res.json({ token, email: user.email });
  } catch (err) {
    next(err);
  }
});

export default router;
