import Fastify from "fastify";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const fastify = Fastify({
  logger: true
});

// JWT плагин
await fastify.register(import("@fastify/jwt"), {
  secret: process.env.JWT_SECRET,
  sign: {
    expiresIn: "30d"
  }
});

// Декоратор для аутентификации
fastify.decorate("authenticate", async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.code(401).send({ message: "Неверный токен" });
  }
});

// Основной плагин приложения
await fastify.register(app);

// Запуск сервера
const PORT = process.env.PORT || 3000;

try {
  await fastify.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`Сервер запущен на порту ${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
