# 📦 PWA «Трекер платежей»

Приложение для учёта коммунальных платежей.

## 🚀 Технологии

**Backend:**
- Node.js + Fastify
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
│   ├── migrations/
│   └── .env.example     # Пример конфигурации
├── client/              # Frontend
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   └── public/
└── README.md
```

## 🔧 Настройка конфигурации (.env файлы)

### Backend (.env)

Создайте файл `server/.env` на основе `server/.env.example`:

```bash
cd server
cp .env.example .env
```

**Параметры конфигурации:**

| Переменная | Описание | Пример |
|------------|----------|--------|
| `PORT` | Порт сервера backend | `3000` |
| `DATABASE_URL` | URL подключения к PostgreSQL | `postgres://user:password@localhost:5432/dbname` |
| `JWT_SECRET` | Секретный ключ для подписи JWT токенов | Любая случайная строка |
| `NODE_ENV` | Режим работы приложения | `development` или `production` |

**Пример заполнения:**
```env
PORT=3000
DATABASE_URL=postgres://postgres:ваш_пароль@localhost:5432/payments_db
JWT_SECRET=ваш_секретный_ключ_для_jwt
NODE_ENV=development
```

> ⚠️ **Важно:** Измените пароль и JWT_SECRET на свои значения!

### Frontend (.env)

Создайте файл `client/.env` для настройки подключения к API:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SERVER_URL=http://localhost:3000
```

**Параметры конфигурации:**

| Переменная | Описание | Значение по умолчанию |
|------------|----------|----------------------|
| `VITE_API_URL` | URL API backend | `http://localhost:3000/api` |
| `VITE_SERVER_URL` | URL сервера (для загрузки файлов) | `http://localhost:3000` |

> 💡 **Примечание:** Если вы запускаете frontend и backend на одном порту (через proxy), эти переменные можно не указывать.

## 🛠 Запуск приложения

### Предварительные требования

- Node.js (версия 18+)
- PostgreSQL

### 1. Подготовка базы данных

Создайте базу данных PostgreSQL:

```bash
psql -U postgres
CREATE DATABASE payments_db;
\q
```

Выполните миграции:

```bash
cd server
npm install
npm run migrate
```

### 2. Настройка Backend

```bash
cd server
cp .env.example .env
# Отредактируйте .env файл (см. раздел "Настройка конфигурации")
npm install
npm start
```

Сервер запустится на **http://localhost:3000**

### 3. Настройка и запуск Frontend

Откройте новый терминал:

```bash
cd client
# Создайте .env файл (опционально, если нужны нестандартные настройки)
echo "VITE_API_URL=http://localhost:3000/api" > .env
echo "VITE_SERVER_URL=http://localhost:3000" >> .env
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
