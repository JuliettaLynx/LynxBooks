<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click.self="close"
  >
    <div
      class="bg-white dark:bg-bg-secondary-dark w-full max-w-md rounded-2xl max-h-[90vh] flex flex-col"
    >
      <!-- Заголовок -->
      <div class="border-b border-border dark:border-border-dark p-4">
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
                ? 'bg-accent text-white'
                : 'border border-border dark:border-border-dark bg-white dark:bg-border-dark/40 text-gray-900 dark:text-white hover:bg-purple-700/10 dark:hover:bg-border-dark',
            ]"
          >
            {{ year }}
          </button>
        </div>
      </div>

      <!-- Кнопки -->
      <div
        class="border-t border-border dark:border-border-dark p-4 flex gap-3"
      >
        <button
          @click="close"
          class="flex-1 px-4 py-2 bg-white dark:bg-border-dark/40 border border-border dark:border-border-dark rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-700/10 dark:hover:bg-border-dark transition-colors"
        >
          Отмена
        </button>
        <button
          @click="selectYear(currentYear)"
          class="flex-1 px-4 py-2 bg-accent text-white rounded-lg transition-colors"
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
