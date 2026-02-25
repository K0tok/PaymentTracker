<template>
  <div class="payment-page">
    <h1 class="page-title">Новая оплата</h1>

    <form @submit.prevent="submitPayment" class="payment-form">
      <SelectWithAdd
        v-model="form.address_id"
        :options="meta.addresses"
        label="Адрес"
        @add="addToMeta('addresses', $event)"
      />

      <SelectWithAdd
        v-model="form.payment_type_id"
        :options="meta.payment_types"
        label="Тип оплаты"
        @add="addToMeta('payment_types', $event)"
      />

      <SelectWithAdd
        v-model="form.bank_id"
        :options="meta.banks"
        label="Банк"
        @add="addToMeta('banks', $event)"
      />

      <div class="form-group">
        <label for="amount">Сумма</label>
        <input
          id="amount"
          v-model.number="form.amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          required
        />
      </div>

      <div class="form-group">
        <label for="month_year">Период оплаты</label>
        <input
          id="month_year"
          v-model="form.month_year"
          type="month"
          required
        />
      </div>

      <div class="form-group">
        <label for="file">Прикрепить файл (необязательно)</label>
        <input
          id="file"
          type="file"
          @change="handleFileChange"
          accept=".pdf,.jpg,.jpeg,.png"
        />
        <span v-if="fileName" class="file-name">📎 {{ fileName }}</span>
      </div>

      <button type="submit" :disabled="loading" class="btn-submit">
        {{ loading ? "Сохранение..." : "Сохранить оплату" }}
      </button>
    </form>

    <Toast v-model="toastMessage" :type="toastType" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { store } from "../store.js";
import SelectWithAdd from "../components/SelectWithAdd.vue";
import Toast from "../components/Toast.vue";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const form = reactive({
  address_id: null,
  payment_type_id: null,
  bank_id: null,
  amount: "",
  month_year: new Date().toISOString().slice(0, 7)
});

const meta = reactive({
  addresses: [],
  payment_types: [],
  banks: []
});

const loading = ref(false);
const toastMessage = ref("");
const toastType = ref("info");
const selectedFile = ref(null);
const fileName = ref("");

onMounted(async () => {
  await loadMeta();
});

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

      // Автозаполнение последними значениями
      if (data.last_address_id) {
        form.address_id = data.last_address_id;
      }
      if (data.last_payment_type_id) {
        form.payment_type_id = data.last_payment_type_id;
      }
      if (data.last_bank_id) {
        form.bank_id = data.last_bank_id;
      }
    }
  } catch (err) {
    console.error("Ошибка загрузки мета-данных:", err);
  }
}

async function addToMeta(field, value) {
  try {
    const res = await fetch(`${API_URL}/user-meta/${field}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${store.token}`
      },
      body: JSON.stringify({ value })
    });

    if (res.ok) {
      const newData = await res.json();
      // Добавляем в локальный список
      const newItem = { id: newData.id, value: newData.value };
      if (!meta[field].find(item => item.value === value)) {
        meta[field].push(newItem);
      }
    }
  } catch (err) {
    console.error("Ошибка добавления в мета-данные:", err);
  }
}

function handleFileChange(event) {
  selectedFile.value = event.target.files[0];
  fileName.value = selectedFile.value?.name || "";
}

async function submitPayment() {
  // Проверка обязательных полей
  if (!form.address_id || !form.payment_type_id || !form.bank_id || !form.amount || !form.month_year) {
    toastMessage.value = "Все поля обязательны";
    toastType.value = "error";
    return;
  }

  loading.value = true;

  try {
    let file_url = null;

    // Загрузка файла, если выбран
    if (selectedFile.value) {
      const formData = new FormData();
      formData.append("file", selectedFile.value);

      const uploadRes = await fetch(`${API_URL}/payments/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${store.token}`
        },
        body: formData
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        file_url = uploadData.file_url;
      }
    }

    // Находим значения по ID для отправки
    const address = meta.addresses.find(a => a.id === form.address_id)?.value || "";
    const payment_type = meta.payment_types.find(p => p.id === form.payment_type_id)?.value || "";
    const bank = meta.banks.find(b => b.id === form.bank_id)?.value || "";

    // Сохранение оплаты
    const res = await fetch(`${API_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${store.token}`
      },
      body: JSON.stringify({
        address,
        payment_type,
        bank,
        amount: form.amount,
        month_year: form.month_year,
        file_url
      })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Ошибка сохранения");
    }

    toastMessage.value = "Оплата успешно сохранена!";
    toastType.value = "success";

    // Сброс формы
    form.address_id = null;
    form.payment_type_id = null;
    form.bank_id = null;
    form.amount = "";
    form.month_year = new Date().toISOString().slice(0, 7);
    selectedFile.value = null;
    fileName.value = "";

    // Перезагрузка мета-данных
    await loadMeta();
  } catch (err) {
    toastMessage.value = err.message;
    toastType.value = "error";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.payment-page {
  max-width: 600px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.payment-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input[type="month"],
.form-group input[type="file"],
.form-group input[type="number"] {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #4a90d9;
}

.file-name {
  display: block;
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.btn-submit {
  width: 100%;
  background: linear-gradient(135deg, #4a90d9 0%, #3672b9 100%);
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
  box-shadow: 0 6px 20px rgba(74, 144, 217, 0.3);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
