<template>
  <div class="history-page">
    <h1 class="page-title">История оплат</h1>
    
    <!-- Фильтры -->
    <div class="filters">
      <div class="filter-group">
        <label>Период</label>
        <input v-model="filters.month" type="month" />
      </div>
      
      <div class="filter-group">
        <label>Адрес</label>
        <select v-model="filters.address">
          <option value="">Все адреса</option>
          <option v-for="addr in uniqueAddresses" :key="addr" :value="addr">
            {{ addr }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Тип оплаты</label>
        <select v-model="filters.payment_type">
          <option value="">Все типы</option>
          <option v-for="type in uniqueTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>
      
      <button @click="clearFilters" class="btn-clear">Сбросить</button>
    </div>
    
    <!-- Список оплат -->
    <div v-if="loading" class="loading">Загрузка...</div>
    
    <div v-else-if="filteredPayments.length === 0" class="empty">
      📭 Нет оплат для отображения
    </div>
    
    <div v-else class="payments-list">
      <div v-for="payment in filteredPayments" :key="payment.id" class="payment-card">
        <div class="payment-header">
          <span class="payment-type">{{ payment.payment_type }}</span>
          <span class="payment-amount">{{ formatAmount(payment.amount) }}</span>
        </div>

        <div class="payment-body">
          <div class="payment-row">
            <span class="label">📍 Адрес:</span>
            <span class="value">{{ payment.address }}</span>
          </div>
          <div class="payment-row">
            <span class="label">🏦 Банк:</span>
            <span class="value">{{ payment.bank }}</span>
          </div>
          <div class="payment-row">
            <span class="label">📅 Период:</span>
            <span class="value">{{ formatMonth(payment.month_year) }}</span>
          </div>
          <div class="payment-row">
            <span class="label">📅 Дата:</span>
            <span class="value">{{ formatDate(payment.created_at) }}</span>
          </div>
        </div>

        <div class="payment-footer">
          <a
            v-if="payment.file_url"
            :href="getFullFileUrl(payment.file_url)"
            target="_blank"
            class="btn-file"
          >
            Файл
          </a>
          <button @click="deletePayment(payment.id)" class="btn-delete">
            Удалить
          </button>
        </div>
      </div>
    </div>
    
    <Toast v-model="toastMessage" :type="toastType" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { store } from "../store.js";
import Toast from "../components/Toast.vue";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const payments = ref([]);
const loading = ref(true);
const toastMessage = ref("");
const toastType = ref("info");

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
    toastMessage.value = err.message;
    toastType.value = "error";
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
  // Если URL уже полный, возвращаем как есть
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    return fileUrl;
  }
  // Иначе добавляем базовый URL сервера
  return `${BASE_URL}${fileUrl}`;
}

async function deletePayment(id) {
  if (!confirm("Вы уверены, что хотите удалить эту запись?")) return;
  
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
    toastMessage.value = "Запись удалена";
    toastType.value = "success";
  } catch (err) {
    toastMessage.value = err.message;
    toastType.value = "error";
  }
}
</script>

<style scoped>
.history-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.filters {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

.filter-group select,
.filter-group input {
  padding: 0.6rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
}

.filter-group select:focus,
.filter-group input:focus {
  outline: none;
  border-color: #4a90d9;
}

.btn-clear {
  align-self: flex-end;
  background: #f0f0f0;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-clear:hover {
  background: #e0e0e0;
}

.loading,
.empty {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

.empty {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.payments-list {
  display: grid;
  gap: 1.5rem;
}

.payment-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.3s;
}

.payment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

.payment-header {
  background: linear-gradient(135deg, #4a90d9 0%, #3672b9 100%);
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payment-type {
  font-weight: 600;
  font-size: 1.1rem;
}

.payment-amount {
  font-weight: 700;
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
}

.payment-body {
  padding: 1.25rem 1.5rem;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.payment-row:last-child {
  border-bottom: none;
}

.payment-row .label {
  color: #666;
  font-weight: 500;
}

.payment-row .value {
  color: #333;
  text-align: right;
}

.payment-footer {
  padding: 1rem 1.5rem;
  background: #f9f9f9;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-file,
.btn-delete {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
  text-decoration: none;
}

.btn-file {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-file:hover {
  background: #bbdefb;
}

.btn-delete {
  background: #ffebee;
  color: #c62828;
  border: none;
}

.btn-delete:hover {
  background: #ffcdd2;
}

@media (max-width: 600px) {
  .filters {
    grid-template-columns: 1fr;
  }
  
  .payment-footer {
    flex-direction: column;
  }
  
  .btn-file,
  .btn-delete {
    width: 100%;
    text-align: center;
  }
}
</style>
