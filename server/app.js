import cors from "@fastify/cors";
import staticPlugin from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function app(fastify, options) {
  // Плагины
  await fastify.register(cors, {
    origin: true
  });

  await fastify.register(staticPlugin, {
    root: path.join(__dirname, "uploads"),
    prefix: "/uploads/"
  });

  // Маршруты
  await fastify.register(import("./routes/auth.js"), { prefix: "/api/auth" });
  await fastify.register(import("./routes/payments.js"), { prefix: "/api/payments" });
  await fastify.register(import("./routes/userMeta.js"), { prefix: "/api/user-meta" });
}
