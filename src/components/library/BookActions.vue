<template>
  <div class="relative" @click.stop v-click-outside="closeMenu">
    <!-- Кнопка трёх точек (только для плитки) -->
    <button v-if="!isGrid" @click="toggleMenu" class="w-6">
      <span class="text-2xl font-black">⋯</span>
    </button>

    <!-- Меню с действиями (для плитки) -->
    <div
      v-if="!isGrid && isOpen"
      class="absolute right-0 top-full bg-white dark:bg-bg-secondary-dark rounded-lg shadow-lg border border-border dark:border-border-dark z-10 min-w-[120px]"
    >
      <button
        @click="handleAction('favorite')"
        class="w-full px-4 py-2 text-left border-b border-border dark:border-border-dark hover:bg-purple-400/10 dark:hover:bg-border-dark/50 flex items-center gap-1"
        :class="book.isFavorite ? 'text-red-500' : 'dark:text-gray-300'"
      >
        <span class="w-5 text-center">♥</span>
        {{ book.isFavorite ? "В избранном" : "В избранное" }}
      </button>
      <button
        @click="handleAction('edit')"
        class="w-full px-4 py-2 text-left border-b border-border dark:border-border-dark hover:bg-purple-400/10 dark:hover:bg-border-dark/50 flex items-center gap-1 dark:text-gray-300"
      >
        <span class="w-5 text-center">✎</span> Редактировать
      </button>
      <button
        @click="handleAction('delete')"
        class="w-full px-4 py-2 text-left hover:bg-purple-400/10 dark:hover:bg-border-dark/50 flex items-center gap-1 text-red-600 dark:text-red-400"
      >
        <span class="w-5 text-center">🗑</span> Удалить
      </button>
    </div>

    <!-- Вертикальные кнопки для режима карточек -->
    <div v-if="isGrid" class="flex flex-col gap-1">
      <button
        @click="handleAction('favorite')"
        class="p-1 rounded-lg transition-colors"
        :class="book.isFavorite ? 'text-red-500' : 'dark:text-gray-400'"
      >
        <span class="text-lg">♥</span>
      </button>
      <button
        @click="handleAction('edit')"
        class="p-1 hover:bg-purple-700/10 dark:hover:bg-border-dark rounded-lg transition-colors dark:text-gray-400"
      >
        <span class="text-lg">✎</span>
      </button>
      <button
        @click="handleAction('delete')"
        class="p-1 hover:bg-purple-700/10 dark:hover:bg-border-dark rounded-lg transition-colors dark:text-gray-400"
      >
        <span class="text-base">🗑</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Директива для отслеживания кликов вне элемента
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = function (event) {
      // Проверяем, был ли клик вне элемента и его дочерних элементов
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};

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

const closeMenu = () => {
  isOpen.value = false;
};

const handleAction = (action) => {
  emit(action, props.book);
  isOpen.value = false;
};
</script>
