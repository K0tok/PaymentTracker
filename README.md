# 📦 PWA «Трекер платежей»

Приложение для учёта коммунальных платежей.

## 🚀 Технологии

**Backend:**
- Node.js + Express
- PostgreSQL + node-pg-migrate
- JWT авторизация
- Загрузка файлов

**Frontend:**
- Vue 3 + Vite
- Vue Router
- PWA
- Адаптивный дизайн

## 📋 Структура проекта

```
payment-tracker/
├── server/              # Backend
│   ├── routes/
│   ├── middleware/
│   └── migrations/
├── client/              # Frontend
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   └── public/
└── init-db/             # Утилита инициализации БД
```

## 🛠 Запуск

### 1. Подготовка базы данных

Создайте базу данных PostgreSQL. Выполните миграции:

```bash
cd server
npm install
node-pg-migrate up
```

### 2. Запуск backend

```bash
cd server
npm install
npm start
```

Сервер запустится на **http://localhost:3000**

### 3. Запуск frontend (в новом окне)

```bash
cd client
npm install
npm run dev
```

Приложение откроется на **http://localhost:5173**

## 🔐 API запросы

### Авторизация
- `POST /api/auth/register` — Регистрация
- `POST /api/auth/login` — Логин

### Оплаты
- `GET /api/payments` — Список всех оплат
- `GET /api/payments/:id` — Получить оплату по ID
- `POST /api/payments` — Создать оплату
- `PUT /api/payments/:id` — Обновить оплату
- `DELETE /api/payments/:id` — Удалить оплату
- `POST /api/payments/upload` — Загрузить файл

### Мета-данные
- `GET /api/user-meta` — Получить мета-данные
- `PUT /api/user-meta` — Обновить мета-данные

## 📱 PWA возможности

- Офлайн-режим
- Кэширование ресурсов
- Установка на устройство
- Push-уведомления (готовность)

## 🔒 Безопасность

- Хеширование паролей (bcrypt)
- JWT токены с истечением
- Валидация данных
- Защита от CORS

## 🔧 Конфигурация

Файл `server/.env`:
```
PORT=3000
DATABASE_URL=postgres://postgres:root@localhost:5432/payments_db
JWT_SECRET=supersecret
NODE_ENV=development
```
