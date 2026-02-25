import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import paymentRoutes from "./routes/payments.js";
import userMetaRoutes from "./routes/userMeta.js";
import { errorHandler } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// Раздача статических файлов из папки uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Маршруты
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/user-meta", userMetaRoutes);

// Обработка ошибок
app.use(errorHandler);

export default app;
