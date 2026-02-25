<template>
  <div class="select-with-add">
    <label v-if="label" class="label">{{ label }}</label>
    <div class="input-group">
      <select
        :value="modelValue"
        @input="onSelectChange($event.target.value)"
        class="select-input"
      >
        <option value="" disabled>Выберите из списка</option>
        <option v-for="item in options" :key="item.id" :value="item.id">
          {{ item.value }}
        </option>
      </select>
      <button
        type="button"
        @click="showAdd = true"
        class="btn-add"
        title="Добавить новый вариант"
      >
        +
      </button>
    </div>

    <!-- Модальное окно для добавления нового значения -->
    <div v-if="showAdd" class="modal-overlay" @click="showAdd = false">
      <div class="modal" @click.stop>
        <h3>Добавить новое значение</h3>
        <input
          v-model="newValue"
          @keyup.enter="addNewValue"
          ref="newInput"
          placeholder="Введите значение"
          class="modal-input"
          autofocus
        />
        <div class="modal-actions">
          <button type="button" @click="showAdd = false" class="btn-cancel">Отмена</button>
          <button type="button" @click="addNewValue" class="btn-save">Сохранить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: ""
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

const showAdd = ref(false);
const newValue = ref("");
const newInput = ref(null);

watch(showAdd, (val) => {
  if (val) {
    setTimeout(() => newInput.value?.focus(), 100);
  } else {
    newValue.value = "";
  }
});

function onSelectChange(value) {
  emit("update:modelValue", value ? Number(value) : null);
}

function addNewValue() {
  if (newValue.value.trim()) {
    emit("add", newValue.value.trim());
    showAdd.value = false;
  }
}
</script>

<style scoped>
.select-with-add {
  margin-bottom: 1rem;
}

.label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.select-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.select-input:focus {
  outline: none;
  border-color: #4a90d9;
}

.btn-add {
  width: 44px;
  background: linear-gradient(135deg, #4a90d9 0%, #3672b9 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.3s;
}

.btn-add:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(74, 144, 217, 0.3);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  min-width: 320px;
  max-width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.modal-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

.modal-input:focus {
  outline: none;
  border-color: #4a90d9;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-cancel,
.btn-save {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: #f0f0f0;
  border: none;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-save {
  background: linear-gradient(135deg, #4a90d9 0%, #3672b9 100%);
  border: none;
  color: white;
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 144, 217, 0.3);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
