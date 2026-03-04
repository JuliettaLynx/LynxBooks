<template>
  <div class="relative" @click.stop>
    <!-- Кнопка трёх точек (только для плитки) -->
    <button
      v-if="!isGrid"
      @click="toggleMenu"
      class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
    >
      <span class="text-xl">⋯</span>
    </button>

    <!-- Меню с действиями (для плитки) -->
    <div
      v-if="!isGrid && isOpen"
      class="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-1 z-10 min-w-[120px]"
    >
      <button
        @click="handleAction('favorite')"
        class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1"
        :class="book.isFavorite ? 'text-red-500' : 'dark:text-gray-300'"
      >
        <span>♥</span> {{ book.isFavorite ? "В избранном" : "В избранное" }}
      </button>
      <button
        @click="handleAction('edit')"
        class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1 dark:text-gray-300"
      >
        <span>✎</span> Редактировать
      </button>
      <button
        @click="handleAction('delete')"
        class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1 text-red-600 dark:text-red-400"
      >
        <span>🗑</span> Удалить
      </button>
    </div>

    <!-- Вертикальные кнопки для режима карточек -->
    <div v-if="isGrid" class="flex flex-col gap-1">
      <button
        @click="handleAction('favorite')"
        class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        :class="book.isFavorite ? 'text-red-500' : 'dark:text-gray-400'"
      >
        <span class="text-lg">♥</span>
      </button>
      <button
        @click="handleAction('edit')"
        class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors dark:text-gray-400"
      >
        <span class="text-lg">✎</span>
      </button>
      <button
        @click="handleAction('delete')"
        class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors dark:text-gray-400"
      >
        <span class="text-lg">🗑</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
  isGrid: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["favorite", "edit", "delete"]);

const isOpen = ref(false);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const handleAction = (action) => {
  emit(action, props.book);
  isOpen.value = false;
};
</script>
