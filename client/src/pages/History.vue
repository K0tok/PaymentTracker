<template>
  <q-page padding>
    <div class="q-mb-lg text-h4 text-center text-white">История оплат</div>

    <!-- Фильтры -->
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-input
              v-model="filters.month"
              type="month"
              label="Период"
              outlined
              dense
            />
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.address"
              :options="uniqueAddresses"
              label="Адрес"
              outlined
              dense
              clearable
              emit-value
              map-options
            />
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.payment_type"
              :options="uniqueTypes"
              label="Тип оплаты"
              outlined
              dense
              clearable
              emit-value
              map-options
            />
          </div>

          <div class="col-12 col-md-3">
            <q-btn
              label="Сбросить"
              class="full-width"
              color="grey-5"
              text-color="primary"
              @click="clearFilters"
              unelevated
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Список оплат -->
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md">Загрузка...</div>
    </div>

    <div v-else-if="filteredPayments.length === 0" class="text-center q-pa-xl">
      <q-icon name="inbox" size="3em" color="grey-6" />
      <div class="q-mt-md text-grey-7">📭 Нет оплат для отображения</div>
    </div>

    <div v-else class="row q-col-gutter-md">
      <div
        v-for="payment in filteredPayments"
        :key="payment.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <q-card class="payment-card">
          <q-card-section class="bg-primary text-white">
            <div class="row justify-between items-center">
              <div class="text-h6">{{ payment.payment_type }}</div>
              <div class="text-h6 text-weight-bold">{{ formatAmount(payment.amount) }}</div>
            </div>
          </q-card-section>

          <q-card-section>
            <q-list dense>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="location_on" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Адрес</q-item-label>
                  <q-item-label>{{ payment.address }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="account_balance" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Банк</q-item-label>
                  <q-item-label>{{ payment.bank }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="event_month" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Период</q-item-label>
                  <q-item-label>{{ formatMonth(payment.month_year) }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="schedule" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Дата</q-item-label>
                  <q-item-label>{{ formatDate(payment.created_at) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              v-if="payment.file_url"
              label="Файл"
              color="blue-6"
              outline
              icon="file_present"
              :href="getFullFileUrl(payment.file_url)"
              target="_blank"
            />
            <q-space />
            <q-btn
              label="Удалить"
              color="red-6"
              flat
              icon="delete"
              @click="deletePayment(payment.id)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { store } from "../store.js";

const $q = useQuasar();
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const payments = ref([]);
const loading = ref(true);

const filters = reactive({
  month: "",
  address: "",
  payment_type: ""
});

const uniqueAddresses = computed(() => {
  return [...new Set(payments.value.map(p => p.address))];
});

const uniqueTypes = computed(() => {
  return [...new Set(payments.value.map(p => p.payment_type))];
});

const filteredPayments = computed(() => {
  return payments.value.filter(p => {
    if (filters.month && p.month_year !== filters.month) return false;
    if (filters.address && p.address !== filters.address) return false;
    if (filters.payment_type && p.payment_type !== filters.payment_type) return false;
    return true;
  });
});

onMounted(async () => {
  await loadPayments();
});

async function loadPayments() {
  loading.value = true;

  try {
    const res = await fetch(`${API_URL}/payments`, {
      headers: {
        "Authorization": `Bearer ${store.token}`
      }
    });

    if (!res.ok) {
      throw new Error("Ошибка загрузки данных");
    }

    payments.value = await res.json();
  } catch (err) {
    $q.notify({
      type: "error",
      message: err.message
    });
  } finally {
    loading.value = false;
  }
}

function clearFilters() {
  filters.month = "";
  filters.address = "";
  filters.payment_type = "";
}

function formatMonth(monthYear) {
  const [year, month] = monthYear.split("-");
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatAmount(amount) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB"
  }).format(amount);
}

function getFullFileUrl(fileUrl) {
  if (!fileUrl) return "";
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    return fileUrl;
  }
  return `${BASE_URL}${fileUrl}`;
}

async function deletePayment(id) {
  $q.dialog({
    title: "Подтверждение",
    message: "Вы уверены, что хотите удалить эту запись?",
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const res = await fetch(`${API_URL}/payments/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${store.token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Ошибка удаления");
      }

      payments.value = payments.value.filter(p => p.id !== id);
      $q.notify({
        type: "success",
        message: "Запись удалена"
      });
    } catch (err) {
      $q.notify({
        type: "error",
        message: err.message
      });
    }
  });
}
</script>

<style scoped>
.payment-card {
  transition: transform 0.2s, box-shadow 0.3s;
}

.payment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}
</style>
