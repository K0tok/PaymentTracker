<template>
  <q-page class="flex flex-center bg-gradient" padding>
    <div class="register-wrapper">
      <q-card class="register-card">
        <q-card-section class="text-center q-pb-none">
          <q-avatar size="80px" class="q-mb-md logo-avatar">
            <img src="/logo.png" alt="Логотип" />
          </q-avatar>
          <div class="text-h4 text-weight-bold q-mb-xs">Создать аккаунт</div>
          <div class="text-caption text-grey-7">Заполните форму для регистрации</div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit.prevent="register">
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
              autocomplete="new-password"
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

            <q-input
              v-model="confirmPassword"
              :type="isPasswordVisible ? 'text' : 'password'"
              label="Подтверждение пароля"
              placeholder="••••••••"
              outlined
              rounded
              autocomplete="new-password"
              :rules="[val => !!val || 'Подтвердите пароль']"
            >
              <template v-slot:prepend>
                <q-icon name="lock_outline" color="primary" />
              </template>
            </q-input>

            <q-btn
              type="submit"
              label="Зарегистрироваться"
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
                label="Уже есть аккаунт? Войти"
                class="text-weight-medium"
                color="primary"
                flat
                to="/login"
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

const router = useRouter();
const $q = useQuasar();

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const isPasswordVisible = ref(false);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function register() {
  loading.value = true;

  if (password.value !== confirmPassword.value) {
    $q.notify({
      type: "negative",
      message: "Пароли не совпадают",
      position: "top",
      actions: [{ icon: 'close', color: 'white' }]
    });
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

    $q.notify({
      type: "positive",
      message: "Аккаунт создан! Теперь войдите.",
      position: "top",
      actions: [{ icon: 'close', color: 'white' }]
    });

    setTimeout(() => {
      router.push("/login");
    }, 1500);
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

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.register-wrapper {
  width: 100%;
  max-width: 420px;
  animation: fadeInUp 0.5s ease-out;
}

.register-card {
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.logo-avatar {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
}

.btn-gradient {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-gradient:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
