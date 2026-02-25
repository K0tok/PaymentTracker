// Централизованная обработка ошибок
export function errorHandler(err, req, res, next) {
  console.error("❌ Ошибка:", err);

  // Ошибки валидации
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Ошибка валидации",
      error: err.message
    });
  }

  // Ошибки JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Неверный токен",
      error: err.message
    });
  }

  // Ошибки базы данных
  if (err.code) {
    return res.status(500).json({
      message: "Ошибка базы данных",
      error: err.message
    });
  }

  // Ошибки загрузки файлов
  if (err.name === "FileUploadError") {
    return res.status(400).json({
      message: "Ошибка загрузки файла",
      error: err.message
    });
  }

  // Ошибка по умолчанию
  res.status(err.status || 500).json({
    message: err.message || "Внутренняя ошибка сервера",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
}
