<template>
  <q-page padding>
    <div class="q-mb-lg text-h4 text-center text-white">Новая оплата</div>

    <q-card class="q-pa-md">
      <q-form @submit.prevent="submitPayment" class="q-gutter-md">
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
          placeholder="0.00"
          outlined
          step="0.01"
          min="0"
          :rules="[val => !!val || 'Введите сумму']"
        >
          <template v-slot:prepend>
            <q-icon name="attach_money" />
          </template>
        </q-input>

        <q-input
          v-model="form.month_year"
          type="month"
          label="Период оплаты"
          outlined
          :rules="[val => !!val || 'Выберите период']"
        >
          <template v-slot:prepend>
            <q-icon name="event" />
          </template>
        </q-input>

        <q-file
          v-model="selectedFile"
          label="Прикрепить файл (необязательно)"
          outlined
          accept=".pdf,.jpg,.jpeg,.png"
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>

        <q-btn
          type="submit"
          label="Сохранить оплату"
          class="full-width"
          color="primary"
          :loading="loading"
          unelevated
        />
      </q-form>
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
  if (!form.address_id || !form.payment_type_id || !form.bank_id || !form.amount || !form.month_year) {
    $q.notify({
      type: "warning",
      message: "Все поля обязательны"
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
      type: "success",
      message: "Оплата успешно сохранена!"
    });

    form.address_id = null;
    form.payment_type_id = null;
    form.bank_id = null;
    form.amount = "";
    form.month_year = new Date().toISOString().slice(0, 7);
    selectedFile.value = null;

    await loadMeta();
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
