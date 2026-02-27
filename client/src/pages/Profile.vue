<template>
  <q-page padding class="profile-page">
    <div class="page-header q-mb-lg">
      <div class="text-h4 text-weight-bold text-white">Профиль</div>
      <div class="text-subtitle2 text-white opacity-80">Управление аккаунтом и справочниками</div>
    </div>

    <!-- Карточка пользователя -->
    <q-card class="user-card q-mb-lg">
      <q-card-section class="user-card-header">
        <div class="row items-center q-gutter-md">
          <q-avatar size="70px" class="user-avatar">
            <span class="text-h5 text-weight-bold">{{ userInitial }}</span>
          </q-avatar>
          <div>
            <div class="text-h6 text-weight-bold">{{ user.email }}</div>
            <div class="text-caption opacity-80">Пользователь системы</div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-md">
        <q-list>
          <q-item>
            <q-item-section avatar>
              <q-avatar icon="email" color="primary" text-color="white" size="40px" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption class="text-grey-6">Email</q-item-label>
              <q-item-label class="text-weight-medium">{{ user.email }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-avatar icon="badge" color="secondary" text-color="white" size="40px" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption class="text-grey-6">ID пользователя</q-item-label>
              <q-item-label class="text-weight-medium">{{ user.id }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-avatar icon="event" color="accent" text-color="white" size="40px" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption class="text-grey-6">Дата регистрации</q-item-label>
              <q-item-label class="text-weight-medium">{{ formatDate(user.created_at) }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="center" class="q-pa-md">
        <q-btn
          label="Выйти"
          color="negative"
          icon="logout"
          @click="logout"
          unelevated
          rounded
          class="q-px-xl"
        />
      </q-card-actions>
    </q-card>

    <!-- Справочники -->
    <div class="text-h6 text-weight-bold text-white q-mb-md">Справочники</div>
    
    <div class="row q-col-gutter-md">
      <!-- Адреса -->
      <div class="col-12 col-md-4">
        <q-card class="dictionary-card">
          <q-card-section class="dictionary-header bg-primary">
            <div class="row justify-between items-center">
              <div class="row items-center q-gutter-sm">
                <q-avatar icon="location_on" size="32px" color="white" text-color="primary" />
                <div class="text-h6 text-weight-bold">Адреса</div>
              </div>
              <q-btn flat dense round icon="add" color="white" @click="showAddDialog('addresses')" />
            </div>
          </q-card-section>

          <q-card-section class="q-pa-md">
            <q-list>
              <q-item v-for="item in meta.addresses" :key="item.id" class="q-mb-xs rounded-item">
                <q-item-section avatar>
                  <q-avatar icon="location_on" color="grey-3" text-color="grey-7" size="36px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ item.value }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    round
                    icon="delete"
                    color="negative"
                    @click="deleteMetaItem('addresses', item.id)"
                  />
                </q-item-section>
              </q-item>

              <q-item v-if="!meta.addresses.length" class="text-center q-py-md">
                <q-item-section>
                  <q-icon name="location_off" size="32px" color="grey-5" />
                  <q-item-label class="text-grey-6 q-mt-sm">Нет сохранённых адресов</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Типы оплаты -->
      <div class="col-12 col-md-4">
        <q-card class="dictionary-card">
          <q-card-section class="dictionary-header bg-secondary">
            <div class="row justify-between items-center">
              <div class="row items-center q-gutter-sm">
                <q-avatar icon="payments" size="32px" color="white" text-color="secondary" />
                <div class="text-h6 text-weight-bold">Типы оплаты</div>
              </div>
              <q-btn flat dense round icon="add" color="white" @click="showAddDialog('payment_types')" />
            </div>
          </q-card-section>

          <q-card-section class="q-pa-md">
            <q-list>
              <q-item v-for="item in meta.payment_types" :key="item.id" class="q-mb-xs rounded-item">
                <q-item-section avatar>
                  <q-avatar icon="payments" color="grey-3" text-color="grey-7" size="36px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ item.value }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    round
                    icon="delete"
                    color="negative"
                    @click="deleteMetaItem('payment_types', item.id)"
                  />
                </q-item-section>
              </q-item>

              <q-item v-if="!meta.payment_types.length" class="text-center q-py-md">
                <q-item-section>
                  <q-icon name="payments" size="32px" color="grey-5" />
                  <q-item-label class="text-grey-6 q-mt-sm">Нет сохранённых типов</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Банки -->
      <div class="col-12 col-md-4">
        <q-card class="dictionary-card">
          <q-card-section class="dictionary-header bg-accent">
            <div class="row justify-between items-center">
              <div class="row items-center q-gutter-sm">
                <q-avatar icon="account_balance" size="32px" color="white" text-color="accent" />
                <div class="text-h6 text-weight-bold">Банки</div>
              </div>
              <q-btn flat dense round icon="add" color="white" @click="showAddDialog('banks')" />
            </div>
          </q-card-section>

          <q-card-section class="q-pa-md">
            <q-list>
              <q-item v-for="item in meta.banks" :key="item.id" class="q-mb-xs rounded-item">
                <q-item-section avatar>
                  <q-avatar icon="account_balance" color="grey-3" text-color="grey-7" size="36px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ item.value }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    round
                    icon="delete"
                    color="negative"
                    @click="deleteMetaItem('banks', item.id)"
                  />
                </q-item-section>
              </q-item>

              <q-item v-if="!meta.banks.length" class="text-center q-py-md">
                <q-item-section>
                  <q-icon name="account_balance_wallet" size="32px" color="grey-5" />
                  <q-item-label class="text-grey-6 q-mt-sm">Нет сохранённых банков</q-item-label>
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
import "../assets/profile-styles.css";

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
    user.created_at = new Date().toISOString();
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
      model: "",
      type: "text",
      label: labels[field],
      outlined: true
    },
    cancel: true,
    persistent: true,
    ok: {
      label: "Добавить",
      color: "primary",
      unelevated: true
    },
    cancel: {
      label: "Отмена",
      color: "grey-6",
      outline: true
    }
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
      if (!meta[field].find(item => item.id === newData.id)) {
        meta[field].push({ id: newData.id, value: newData.value });
      }
      $q.notify({
        type: "positive",
        message: "Добавлено",
        position: "top",
        actions: [{ icon: 'close', color: 'white' }]
      });
    } else {
      const data = await res.json();
      $q.notify({
        type: "warning",
        message: data.message || "Не удалось добавить",
        position: "top",
        actions: [{ icon: 'close', color: 'white' }]
      });
    }
  } catch (err) {
    $q.notify({
      type: "negative",
      message: err.message,
      position: "top",
      actions: [{ icon: 'close', color: 'white' }]
    });
  }
}

async function deleteMetaItem(field, id) {
  $q.dialog({
    title: "Подтверждение",
    message: "Удалить эту запись?",
    cancel: true,
    persistent: true,
    ok: {
      label: "Удалить",
      color: "negative",
      unelevated: true
    },
    cancel: {
      label: "Отмена",
      color: "grey-6",
      outline: true
    }
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
          type: "positive",
          message: "Удалено",
          position: "top",
          actions: [{ icon: 'close', color: 'white' }]
        });
      } else {
        $q.notify({
          type: "warning",
          message: data.message || "Ошибка удаления",
          position: "top",
          actions: [{ icon: 'close', color: 'white' }]
        });
      }
    } catch (err) {
      $q.notify({
        type: "negative",
        message: err.message,
        position: "top",
        actions: [{ icon: 'close', color: 'white' }]
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
