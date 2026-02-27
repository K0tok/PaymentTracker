<template>
  <q-select
    v-model="selectedValue"
    :options="combinedOptions"
    option-value="id"
    option-label="value"
    :label="label"
    outlined
    rounded
    emit-value
    map-options
    clearable
    color="primary"
    @update:model-value="onSelectChange"
  >
    <template v-slot:prepend>
      <q-icon :name="getIcon()" color="primary" size="20px" />
    </template>
    
    <template v-slot:append>
      <q-btn
        flat
        dense
        round
        icon="add"
        color="primary"
        @click.stop="showAddDialog"
      >
        <q-tooltip>Добавить новое значение</q-tooltip>
      </q-btn>
    </template>
    
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section avatar>
          <q-avatar icon="check" color="primary" text-color="white" v-if="scope.selected" />
          <q-avatar v-else />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{ scope.opt.value }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-separator v-if="scope.lastItem" />
    </template>
  </q-select>
</template>

<script setup>
import { ref, computed } from "vue";
import { useQuasar } from "quasar";

const $q = useQuasar();

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: null
  },
  options: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["update:modelValue", "add"]);

const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
});

const combinedOptions = computed(() => {
  return props.options || [];
});

function getIcon() {
  if (props.label.toLowerCase().includes('адрес')) return 'location_on';
  if (props.label.toLowerCase().includes('тип')) return 'payments';
  if (props.label.toLowerCase().includes('банк')) return 'account_balance';
  return 'list';
}

function onSelectChange(value) {
  emit("update:modelValue", value ? Number(value) : null);
}

function showAddDialog() {
  $q.dialog({
    title: "Добавить новое значение",
    message: "",
    prompt: {
      model: "",
      type: "text",
      label: "Введите значение",
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
  }).onOk((value) => {
    if (value && value.trim()) {
      emit("add", value.trim());
    }
  });
}
</script>

<style scoped>
:deep(.q-field__native),
:deep(.q-field__input) {
  font-size: 15px;
}

:deep(.q-field__label) {
  font-weight: 500;
}

:deep(.q-menu) {
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

:deep(.q-item--selected) {
  background: rgba(79, 70, 229, 0.08);
}
</style>
