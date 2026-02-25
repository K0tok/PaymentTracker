<template>
  <div class="register-page">
    <div class="register-card">
      <h1 class="register-title">📝 Регистрация</h1>

      <form @submit.prevent="register" class="register-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="example@mail.ru"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="new-password"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Подтверждение пароля</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="new-password"
          />
        </div>

        <button type="submit" :disabled="loading" class="btn-submit">
          {{ loading ? "Регистрация..." : "Зарегистрироваться" }}
        </button>

        <router-link to="/login" class="btn-toggle">
          Уже есть аккаунт? Войти
        </router-link>
      </form>

      <div v-if="error" class="error-message">{{ error }}</div>

      <Toast v-model="toastMessage" :type="toastType" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Toast from "../components/Toast.vue";

const router = useRouter();

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const error = ref("");
const toastMessage = ref("");
const toastType = ref("info");

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function register() {
  loading.value = true;
  error.value = "";

  if (password.value !== confirmPassword.value) {
    error.value = "Пароли не совпадают";
    toastMessage.value = "Пароли не совпадают";
    toastType.value = "error";
    loading.value = false;
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value, password: password.value })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Ошибка регистрации");
    }

    toastMessage.value = "Аккаунт создан! Теперь войдите.";
    toastType.value = "success";

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  } catch (err) {
    error.value = err.message;
    toastMessage.value = err.message;
    toastType.value = "error";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.register-card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
}

.register-title {
  text-align: center;
  margin: 0 0 2rem 0;
  color: #333;
  font-size: 1.8rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #555;
  font-size: 0.95rem;
}

.form-group input {
  padding: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.3s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-toggle {
  display: block;
  text-align: center;
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.95rem;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-toggle:hover {
  background: #667eea;
  color: white;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee;
  color: #c00;
  border-radius: 8px;
  text-align: center;
  font-size: 0.9rem;
}
</style>
