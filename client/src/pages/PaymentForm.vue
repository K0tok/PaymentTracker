<template>
  <q-page padding class="payment-page">
    <div class="page-header q-mb-lg">
      <div class="text-h4 text-weight-bold text-white">Новая оплата</div>
      <div class="text-subtitle2 text-white opacity-80">Заполните данные о платеже</div>
    </div>

    <q-card class="payment-card">
      <q-card-section class="q-pa-lg">
        <q-form ref="paymentForm" @submit.prevent="submitPayment" class="q-gutter-md">
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

          <q-input
            v-model.number="form.amount"
            type="number"
            label="Сумма"
            placeholder="0.00 ₽"
            outlined
            rounded
            step="0.01"
            min="0"
            :rules="[val => !!val || 'Введите сумму']"
            color="primary"
          >
            <template v-slot:prepend>
              <q-icon name="attach_money" color="primary" />
            </template>
          </q-input>

          <q-input
            v-model="form.month_year"
            type="month"
            label="Период оплаты"
            outlined
            rounded
            :rules="[val => !!val || 'Выберите период']"
            color="primary"
          >
            <template v-slot:prepend>
              <q-icon name="event_month" color="primary" />
            </template>
          </q-input>

          <q-file
            v-model="selectedFile"
            label="Прикрепить файл (необязательно)"
            outlined
            rounded
            accept=".pdf,.jpg,.jpeg,.png"
            color="primary"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" color="primary" />
            </template>
            <template v-slot:append>
              <q-icon name="folder_open" color="grey-7" />
            </template>
          </q-file>

          <div class="q-mt-md">
            <q-btn
              type="submit"
              label="Сохранить оплату"
              color="primary"
              :loading="loading"
              unelevated
              rounded
              class="full-width btn-submit q-py-sm"
              size="lg"
            >
              <template v-slot:loading>
                <q-spinner-dots size="28px" />
              </template>
            </q-btn>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useQuasar } from "quasar";
import { store } from "../store.js";
import SelectWithAdd from "../components/SelectWithAdd.vue";

const $q = useQuasar();
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const paymentForm = ref(null);

const form = reactive({
  address_id: null,
  payment_type_id: null,
  bank_id: null,
  amount: null,
  month_year: new Date().toISOString().slice(0, 7)
});

const meta = reactive({
  addresses: [],
  payment_types: [],
  banks: []
});

const loading = ref(false);
const selectedFile = ref(null);

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
      const newItem = { id: newData.id, value: newData.value };
      if (!meta[field].find(item => item.value === value)) {
        meta[field].push(newItem);
      }
    }
  } catch (err) {
    console.error("Ошибка добавления в мета-данные:", err);
  }
}

async function submitPayment() {
  if (!form.address_id || !form.payment_type_id || !form.bank_id || form.amount === null || form.amount === '' || !form.month_year) {
    $q.notify({
      type: "warning",
      message: "Все поля обязательны",
      position: "top",
      actions: [{ icon: 'close', color: 'white' }]
    });
    return;
  }

  loading.value = true;

  try {
    let file_url = null;

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

    const address = meta.addresses.find(a => a.id === form.address_id)?.value || "";
    const payment_type = meta.payment_types.find(p => p.id === form.payment_type_id)?.value || "";
    const bank = meta.banks.find(b => b.id === form.bank_id)?.value || "";

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

    $q.notify({
      type: "positive",
      message: "Оплата успешно сохранена!",
      position: "top",
      actions: [{ icon: 'close', color: 'white' }]
    });

    form.address_id = null;
    form.payment_type_id = null;
    form.bank_id = null;
    form.amount = null;
    form.month_year = new Date().toISOString().slice(0, 7);
    selectedFile.value = null;

    await loadMeta();
    paymentForm.value?.resetValidation();
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
.payment-page {
  background: linear-gradient(180deg, #667eea 0%, #f1f5f9 100%);
  min-height: 100vh;
  padding-top: 24px;
}

.page-header {
  text-align: center;
}

.payment-card {
  max-width: 540px;
  margin: 0 auto;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.98);
}

.btn-submit {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
}

.btn-submit:active {
  transform: translateY(0);
}

:deep(.q-field__native),
:deep(.q-field__input) {
  font-size: 15px;
}

:deep(.q-field__label) {
  font-weight: 500;
}
</style>
