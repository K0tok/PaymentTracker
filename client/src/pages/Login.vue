<template>
  <q-page class="flex flex-center bg-gradient" padding>
    <q-card class="login-card q-pa-lg">
      <q-card-section class="text-center">
        <div class="text-h4 q-mb-md">🔐 Вход</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="login" class="q-gutter-md">
          <q-input
            v-model="email"
            type="email"
            label="Email"
            placeholder="example@mail.ru"
            outlined
            autocomplete="email"
            :rules="[val => !!val || 'Введите email']"
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            :type="isPasswordVisible ? 'text' : 'password'"
            label="Пароль"
            placeholder="••••••••"
            outlined
            autocomplete="current-password"
            :rules="[val => !!val || 'Введите пароль']"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-btn
                flat
                dense
                icon="visibility"
                @click="isPasswordVisible = !isPasswordVisible"
              />
            </template>
          </q-input>

          <q-btn
            type="submit"
            label="Войти"
            class="full-width"
            color="primary"
            :loading="loading"
            unelevated
          />

          <q-btn
            label="Нет аккаунта? Зарегистрироваться"
            class="full-width"
            color="primary"
            outline
            to="/register"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { store } from "../store.js";

const router = useRouter();
const $q = useQuasar();

const email = ref("");
const password = ref("");
const loading = ref(false);
const isPasswordVisible = ref(false);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function login() {
  loading.value = true;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value, password: password.value })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Ошибка входа");
    }

    store.setToken(data.token, { email: data.email });
    
    $q.notify({
      type: "success",
      message: "Добро пожаловать!"
    });

    setTimeout(() => {
      router.push("/payment");
    }, 500);
  } catch (err) {
    $q.notify({
      type: "error",
      message: err.message
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.login-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
</style>
