<template>
  <div v-if="message" :class="['toast', toastClass]" @click="close">
    {{ message }}
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    default: "info",
    validator: (v) => ["success", "error", "info", "warning"].includes(v)
  },
  duration: {
    type: Number,
    default: 3000
  }
});

const emit = defineEmits(["update:modelValue"]);

const message = ref(props.modelValue);

const toastClass = {
  success: "toast-success",
  error: "toast-error",
  info: "toast-info",
  warning: "toast-warning"
}[props.type];

let timeout = null;

watch(() => props.modelValue, (newVal) => {
  message.value = newVal;
  
  if (newVal && props.duration > 0) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      emit("update:modelValue", "");
    }, props.duration);
  }
}, { immediate: true });

function close() {
  emit("update:modelValue", "");
}
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.toast-success {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
}

.toast-error {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.toast-info {
  background: linear-gradient(135deg, #17a2b8 0%, #117a8b 100%);
}

.toast-warning {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
  color: #212529;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
