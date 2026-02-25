<template>
  <q-select
    v-model="selectedValue"
    :options="combinedOptions"
    option-value="id"
    option-label="value"
    :label="label"
    outlined
    emit-value
    map-options
    clearable
    @update:model-value="onSelectChange"
  >
    <template v-slot:append>
      <q-btn
        flat
        dense
        icon="add"
        @click.stop="showAddDialog"
      >
        <q-tooltip>Добавить новое значение</q-tooltip>
      </q-btn>
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

function onSelectChange(value) {
  emit("update:modelValue", value ? Number(value) : null);
}

function showAddDialog() {
  let newValue = "";

  $q.dialog({
    title: "Добавить новое значение",
    message: "",
    prompt: {
      model: newValue,
      type: "text",
      label: "Введите значение",
      outlined: true
    },
    cancel: true,
    persistent: true
  }).onOk((value) => {
    if (value && value.trim()) {
      emit("add", value.trim());
    }
  });
}
</script>
