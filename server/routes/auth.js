import bcrypt from "bcrypt";
import { pool } from "../db.js";

export default async function authRoutes(fastify, options) {
  // Регистрация нового пользователя
  fastify.post("/register", async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.code(400).send({ message: "Email и пароль обязательны" });
    }

    // Проверка существующего пользователя
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return reply.code(400).send({ message: "Пользователь уже существует" });
    }

    // Хэширование пароля
    const hash = await bcrypt.hash(password, 10);

    // Создание пользователя
    const { rows } = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hash]
    );

    return reply.code(201).send({ id: rows[0].id, email: rows[0].email });
  });

  // Логин пользователя
  fastify.post("/login", async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.code(400).send({ message: "Email и пароль обязательны" });
    }

    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (!rows.length) {
      return reply.code(400).send({ message: "Пользователь не найден" });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return reply.code(400).send({ message: "Неверный пароль" });
    }

    const token = fastify.jwt.sign({ id: user.id, email: user.email });

    return reply.send({ token, email: user.email });
  });
}
