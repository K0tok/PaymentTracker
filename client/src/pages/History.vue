<template>
  <q-page padding class="history-page">
    <div class="page-header q-mb-lg">
      <div class="text-h4 text-weight-bold text-white">История оплат</div>
      <div class="text-subtitle2 text-white opacity-80">Все ваши платежи в одном месте</div>
    </div>

    <!-- Фильтры -->
    <q-card class="filter-card q-mb-lg">
      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-md-3">
            <q-input
              v-model="filters.month_from"
              type="month"
              label="Период (с)"
              outlined
              dense
              rounded
              color="primary"
            >
              <template v-slot:prepend>
                <q-icon name="event_month" color="primary" size="18px" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-3">
            <q-input
              v-model="filters.month_to"
              type="month"
              label="Период (по)"
              outlined
              dense
              rounded
              color="primary"
            >
              <template v-slot:prepend>
                <q-icon name="event_month" color="primary" size="18px" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.address"
              :options="uniqueAddresses"
              label="Адрес"
              outlined
              dense
              rounded
              clearable
              emit-value
              map-options
              color="primary"
            >
              <template v-slot:prepend>
                <q-icon name="location_on" color="primary" size="18px" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.payment_type"
              :options="uniqueTypes"
              label="Тип оплаты"
              outlined
              dense
              rounded
              clearable
              emit-value
              map-options
              color="primary"
            >
              <template v-slot:prepend>
                <q-icon name="payments" color="primary" size="18px" />
              </template>
            </q-select>
          </div>
        </div>

        <div class="row q-mt-sm q-col-gutter-sm">
          <div class="col-12 col-md-6">
            <q-btn
              label="Сбросить фильтры"
              class="full-width"
              color="grey-6"
              text-color="white"
              @click="clearFilters"
              unelevated
              rounded
              icon="filter_alt_off"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-btn
              label="Применить фильтры"
              class="full-width btn-filter"
              color="primary"
              @click="applyFilters"
              unelevated
              rounded
              icon="filter_list"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Список оплат -->
    <div v-if="loading" class="text-center q-pa-xl q-pt-lg">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-grey-7">Загрузка данных...</div>
    </div>

    <div v-else-if="filteredPayments.length === 0" class="text-center q-pa-xl empty-state q-pt-lg">
      <q-icon name="inbox" size="4em" color="grey-6" />
      <div class="q-mt-md text-h6 text-grey-7">Нет оплат для отображения</div>
      <div class="text-caption text-grey-5">Добавьте первую оплату в разделе "Новая"</div>
    </div>

    <div v-else class="row q-col-gutter-md q-pt-lg">
      <div
        v-for="payment in filteredPayments"
        :key="payment.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <q-card class="payment-card">
          <q-card-section class="payment-header">
            <div class="row justify-between items-center">
              <div>
                <div class="text-caption opacity-80">{{ payment.payment_type }}</div>
                <div class="text-h6 text-weight-bold">{{ formatAmount(payment.amount) }}</div>
              </div>
              <q-avatar size="40px" class="payment-icon">
                <q-icon name="payments" size="20px" />
              </q-avatar>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-md">
            <q-list>
              <q-item class="q-py-xs">
                <q-item-section avatar>
                  <q-icon name="location_on" size="18px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption class="text-grey-6">Адрес</q-item-label>
                  <q-item-label class="text-weight-medium">{{ payment.address }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item class="q-py-xs">
                <q-item-section avatar>
                  <q-icon name="account_balance" size="18px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption class="text-grey-6">Банк</q-item-label>
                  <q-item-label class="text-weight-medium">{{ payment.bank }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item class="q-py-xs">
                <q-item-section avatar>
                  <q-icon name="event_month" size="18px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption class="text-grey-6">Период</q-item-label>
                  <q-item-label class="text-weight-medium">{{ formatMonth(payment.month_year) }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item class="q-py-xs">
                <q-item-section avatar>
                  <q-icon name="schedule" size="18px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption class="text-grey-6">Дата</q-item-label>
                  <q-item-label class="text-weight-medium">{{ formatDate(payment.created_at) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="q-pa-sm">
            <q-btn
              v-if="payment.file_url"
              label="Файл"
              color="primary"
              outline
              rounded
              size="sm"
              icon="file_present"
              :href="getFullFileUrl(payment.file_url)"
              target="_blank"
              class="q-mr-sm"
            />
            <q-btn
              label="Удалить"
              color="negative"
              flat
              rounded
              size="sm"
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
  month_from: "",
  month_to: "",
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
    if (filters.month_from && p.month_year < filters.month_from) return false;
    if (filters.month_to && p.month_year > filters.month_to) return false;
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
      type: "negative",
      message: err.message,
      position: "top",
      actions: [{ icon: 'close', color: 'white' }]
    });
  } finally {
    loading.value = false;
  }
}

function clearFilters() {
  filters.month_from = "";
  filters.month_to = "";
  filters.address = "";
  filters.payment_type = "";
}

function applyFilters() {
  // Фильтры применяются реактивно через computed
  $q.notify({
    type: "info",
    message: "Фильтры применены",
    position: "top",
    actions: [{ icon: 'close', color: 'white' }]
  });
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
        type: "positive",
        message: "Запись удалена",
        position: "top",
        actions: [{ icon: 'close', color: 'white' }]
      });
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
</script>

<style scoped>
.history-page {
  background: linear-gradient(180deg, #667eea 0%, #f1f5f9 100%);
  min-height: 100vh;
  padding-top: 24px;
}

.page-header {
  text-align: center;
}

.filter-card {
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.btn-filter {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  font-weight: 600;
}

.payment-card {
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.3s;
  overflow: hidden;
}


.payment-header {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
}

.payment-icon {
  background: rgba(255, 255, 255, 0.2);
}

.empty-state {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 48px;
}

:deep(.q-item__label--caption) {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
