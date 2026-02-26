<template>
  <q-page padding >
    <div class="text-h4 text-center text-white q-mb-lg">Профиль</div>

    <q-card class="q-mb-lg" style="max-width: 600px; margin: 0 auto;">
      <q-card-section class="bg-primary text-white">
        <div class="row items-center q-gutter-md">
          <q-avatar size="60px" color="white" text-color="primary">
            <span class="text-h5">{{ userInitial }}</span>
          </q-avatar>
          <div>
            <div class="text-h6">{{ user.email }}</div>
            <div class="text-caption opacity-80">ID: {{ user.id }}</div>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <q-list>
          <q-item>
            <q-item-section avatar>
              <q-icon name="person" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Email</q-item-label>
              <q-item-label>{{ user.email }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon name="badge" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>ID пользователя</q-item-label>
              <q-item-label>{{ user.id }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon name="event" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Дата регистрации</q-item-label>
              <q-item-label>{{ formatDate(user.created_at) }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          label="Выйти"
          color="red"
          icon="logout"
          @click="logout"
          unelevated
          class="q-mr-sm"
        />
      </q-card-actions>
    </q-card>

    <!-- Справочники -->
    <div class="row q-col-gutter-md">
      <!-- Адреса -->
      <div class="col-12 col-md-4">
        <q-card style="height: 100%;">
          <q-card-section class="bg-secondary text-white">
            <div class="row justify-between items-center">
              <div class="text-h6">Адреса</div>
              <q-btn flat dense round icon="add" color="white" @click="showAddDialog('addresses')" />
            </div>
          </q-card-section>

          <q-card-section>
            <q-list dense>
              <q-item v-for="item in meta.addresses" :key="item.id">
                <q-item-section>
                  <q-item-label>{{ item.value }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    round
                    icon="delete"
                    color="red"
                    @click="deleteMetaItem('addresses', item.id)"
                  />
                </q-item-section>
              </q-item>

              <q-item v-if="!meta.addresses.length">
                <q-item-section class="text-grey-7 text-center">
                  Нет сохранённых адресов
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Типы оплаты -->
      <div class="col-12 col-md-4">
        <q-card style="height: 100%;">
          <q-card-section class="bg-secondary text-white">
            <div class="row justify-between items-center">
              <div class="text-h6">Типы оплаты</div>
              <q-btn flat dense round icon="add" color="white" @click="showAddDialog('payment_types')" />
            </div>
          </q-card-section>

          <q-card-section>
            <q-list dense>
              <q-item v-for="item in meta.payment_types" :key="item.id">
                <q-item-section>
                  <q-item-label>{{ item.value }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    round
                    icon="delete"
                    color="red"
                    @click="deleteMetaItem('payment_types', item.id)"
                  />
                </q-item-section>
              </q-item>

              <q-item v-if="!meta.payment_types.length">
                <q-item-section class="text-grey-7 text-center">
                  Нет сохранённых типов
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Банки -->
      <div class="col-12 col-md-4">
        <q-card style="height: 100%;">
          <q-card-section class="bg-secondary text-white">
            <div class="row justify-between items-center">
              <div class="text-h6">Банки</div>
              <q-btn flat dense round icon="add" color="white" @click="showAddDialog('banks')" />
            </div>
          </q-card-section>

          <q-card-section>
            <q-list dense>
              <q-item v-for="item in meta.banks" :key="item.id">
                <q-item-section>
                  <q-item-label>{{ item.value }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    round
                    icon="delete"
                    color="red"
                    @click="deleteMetaItem('banks', item.id)"
                  />
                </q-item-section>
              </q-item>

              <q-item v-if="!meta.banks.length">
                <q-item-section class="text-grey-7 text-center">
                  Нет сохранённых банков
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { store } from "../store.js";
import router from "../router.js";

const $q = useQuasar();
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const user = reactive({
  id: "",
  email: "",
  created_at: ""
});

const meta = reactive({
  addresses: [],
  payment_types: [],
  banks: []
});

const userInitial = computed(() => {
  const email = user.email || "";
  return email.charAt(0).toUpperCase();
});

onMounted(async () => {
  await loadUserData();
  await loadMeta();
});

async function loadUserData() {
  try {
    const token = store.token;
    const payload = JSON.parse(atob(token.split(".")[1]));
    user.id = payload.id;
    user.email = payload.email;
    user.created_at = new Date().toISOString(); // Можно получить с сервера
  } catch (err) {
    console.error("Ошибка декодирования токена:", err);
  }
}

async function loadMeta() {
  try {
    const res = await fetch(`${API_URL}/user-meta`, {
      headers: {
        "Authorization": `Bearer ${store.token}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      meta.addresses = data.addresses || [];
      meta.payment_types = data.payment_types || [];
      meta.banks = data.banks || [];
    }
  } catch (err) {
    console.error("Ошибка загрузки мета-данных:", err);
  }
}

function showAddDialog(field) {
  let newValue = "";

  const titles = {
    addresses: "Добавить адрес",
    payment_types: "Добавить тип оплаты",
    banks: "Добавить банк"
  };

  const labels = {
    addresses: "Введите адрес",
    payment_types: "Введите тип оплаты",
    banks: "Введите название банка"
  };

  $q.dialog({
    title: titles[field],
    message: "",
    prompt: {
      model: newValue,
      type: "text",
      label: labels[field],
      outlined: true
    },
    cancel: true,
    persistent: true
  }).onOk(async (value) => {
    if (value && value.trim()) {
      await addMetaItem(field, value.trim());
    }
  });
}

async function addMetaItem(field, value) {
  try {
    const res = await fetch(`${API_URL}/user-meta/${field}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${store.token}`
      },
      body: JSON.stringify({ value })
    });

    if (res.ok || res.status === 200) {
      const newData = await res.json();
      // Проверяем, есть ли уже такая запись в списке
      if (!meta[field].find(item => item.id === newData.id)) {
        meta[field].push({ id: newData.id, value: newData.value });
      }
      $q.notify({
        type: "success",
        message: newData.id ? "Добавлено" : "Уже существует"
      });
    } else {
      const data = await res.json();
      $q.notify({
        type: "warning",
        message: data.message || "Не удалось добавить"
      });
    }
  } catch (err) {
    $q.notify({
      type: "error",
      message: err.message
    });
  }
}

async function deleteMetaItem(field, id) {
  $q.dialog({
    title: "Подтверждение",
    message: "Удалить эту запись?",
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const res = await fetch(`${API_URL}/user-meta/${field}/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${store.token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        meta[field] = meta[field].filter(item => item.id !== id);
        $q.notify({
          type: "success",
          message: "Удалено"
        });
      } else {
        $q.notify({
          type: "warning",
          message: data.message || "Ошибка удаления"
        });
      }
    } catch (err) {
      $q.notify({
        type: "error",
        message: err.message
      });
    }
  });
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function logout() {
  store.logout();
  router.push("/login");
}
</script>
