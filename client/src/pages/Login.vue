<template>
  <q-page class="flex flex-center bg-gradient" padding>
    <div class="login-wrapper">
      <q-card class="login-card">
        <q-card-section class="text-center q-pb-none">
          <div class="logo-wrapper q-mb-md">
            <img src="/logo.png" alt="Логотип" class="logo-image logo-image--auth" />
          </div>
          <div class="text-h4 text-weight-bold q-mb-xs">С возвращением!</div>
          <div class="text-caption text-grey-7">Войдите для продолжения</div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit.prevent="login">
            <q-input
              v-model="email"
              type="email"
              label="Email"
              placeholder="example@mail.ru"
              outlined
              rounded
              autocomplete="email"
              :rules="[val => !!val || 'Введите email']"
            >
              <template v-slot:prepend>
                <q-icon name="email_outlined" color="primary" />
              </template>
            </q-input>

            <q-input
              v-model="password"
              :type="isPasswordVisible ? 'text' : 'password'"
              label="Пароль"
              placeholder="••••••••"
              outlined
              rounded
              autocomplete="current-password"
              :rules="[val => !!val || 'Введите пароль']"
            >
              <template v-slot:prepend>
                <q-icon name="lock_outline" color="primary" />
              </template>
              <template v-slot:append>
                <q-btn
                  flat
                  dense
                  round
                  icon="visibility"
                  @click="isPasswordVisible = !isPasswordVisible"
                />
              </template>
            </q-input>

            <q-btn
              type="submit"
              label="Войти"
              class="full-width btn-gradient q-py-sm"
              size="lg"
              rounded
              unelevated
              :loading="loading"
            >
              <template v-slot:loading>
                <q-spinner-dots size="24px" />
              </template>
            </q-btn>

            <div class="text-center q-mt-md">
              <q-btn
                label="Нет аккаунта? Зарегистрироваться"
                class="text-weight-medium"
                color="primary"
                flat
                to="/register"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { store } from "../store.js";
import "../assets/logo-styles.css";
import "../assets/login-styles.css";

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
      type: "positive",
      message: "Добро пожаловать!",
      position: "top",
      actions: [{ icon: 'close', color: 'white' }]
    });

    setTimeout(() => {
      router.push("/payment");
    }, 500);
  } catch (err) {
    $q.notify({
      type: "negative",
      message: err.message,
      position: "top",
      actions: [{ icon: 'close', color: 'white' }]
    });
  } finally {
    loading.value = false;
  }
}
</script>
