<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click.self="close"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm transform transition-all"
    >
      <!-- Заголовок -->
      <div class="border-b dark:border-gray-700 p-4">
        <h3 class="text-lg font-semibold dark:text-white">Выберите год</h3>
      </div>

      <!-- Список годов -->
      <div class="p-4 max-h-96 overflow-y-auto">
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="year in years"
            :key="year"
            @click="selectYear(year)"
            class="px-3 py-2 text-center rounded-lg transition-colors"
            :class="[
              year === currentYear
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600',
            ]"
          >
            {{ year }}
          </button>
        </div>
      </div>

      <!-- Кнопки -->
      <div class="border-t dark:border-gray-700 p-4 flex gap-3">
        <button
          @click="close"
          class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Отмена
        </button>
        <button
          @click="selectYear(currentYear)"
          class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Выбрать
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  currentYear: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["close", "select"]);

const years = computed(() => {
  const current = new Date().getFullYear();
  const start = current - 10;
  const end = current + 5;
  const yearsList = [];
  for (let i = start; i <= end; i++) {
    yearsList.push(i);
  }
  return yearsList;
});

const selectYear = (year) => {
  emit("select", year);
  close();
};

const close = () => {
  emit("close");
};
</script>
