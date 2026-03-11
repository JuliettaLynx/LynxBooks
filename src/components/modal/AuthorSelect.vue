<template>
  <div class="relative w-full">
    <!-- Поле ввода -->
    <div class="relative">
      <input
        type="text"
        v-model="searchQuery"
        @focus="isOpen = true"
        @input="handleInput"
        @keydown.down.prevent="selectNext"
        @keydown.up.prevent="selectPrevious"
        @keydown.enter.prevent="selectCurrent"
        @keydown.esc="isOpen = false"
        @blur="handleBlur"
        :placeholder="placeholder"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 dark:text-white"
      />

      <!-- Стрелка вниз -->
      <button
        @click="toggleDropdown"
        @mousedown.prevent
        type="button"
        class="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>

    <!-- Выпадающий список -->
    <div
      v-if="isOpen && filtredAuthors.length > 0"
      class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 dark:text-gray-100 border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <ul>
        <li
          v-for="(author, index) in filtredAuthors"
          :key="author.id"
          @mousedown.prevent="selectAuthor(author.name)"
          @mouseenter="highlightedIndex = index"
          :class="[
            'px-4 py-2 cursor-pointer transition-colors',
            highlightedIndex === index
              ? 'bg-blue-500 text-white'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700',
          ]"
        >
          {{ author.name }}
        </li>
      </ul>
    </div>

    <!-- Сообщение, если ничего не найдено, но есть введенный текст -->
    <div
      v-else-if="isOpen && searchQuery && filtredAuthors.length === 0"
      class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 dark:text-gray-100 border border-gray-300 rounded-lg shadow-lg p-4 text-gray-500 text-center"
    >
      Будет добавлено:
      <span class="font-medium text-blue-500">"{{ searchQuery }}"</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { authorsList } from "../../constants/authors";

// Props
const props = defineProps({
  modelValue: {
    type: [String, null],
    default: null,
  },
  placeholder: {
    type: String,
    default: "Издательство",
  },
});

// Emits
const emit = defineEmits(["update:modelValue"]);

// Состояние
const searchQuery = ref("");
const isOpen = ref(false);
const highlightedIndex = ref(-1);
const isSelecting = ref(false); // Флаг для отслеживания выбора из списка

// Методы
const selectAuthor = (authorName) => {
  isSelecting.value = true; // Устанавливаем флаг, что идет выбор из списка
  searchQuery.value = authorName;
  isOpen.value = false;
  emit("update:modelValue", authorName);

  // Сбрасываем флаг через небольшую задержку
  setTimeout(() => {
    isSelecting.value = false;
  }, 100);
};

// Фильтрация издательств по поисковому запросу
const filtredAuthors = computed(() => {
  if (!searchQuery.value) return authorsList;

  const query = searchQuery.value.toLowerCase().trim();
  return authorsList.filter((author) =>
    author.name.toLowerCase().includes(query),
  );
});

// Обработка ввода
const handleInput = () => {
  isOpen.value = true;
  highlightedIndex.value = -1;

  // Если поле пустое, очищаем значение
  if (!searchQuery.value.trim()) {
    emit("update:modelValue", null);
  }
};

// Обработка потери фокуса
const handleBlur = () => {
  // Если идет выбор из списка, не делаем ничего
  if (isSelecting.value) {
    return;
  }

  // Сохраняем текущее значение при потере фокуса
  if (searchQuery.value.trim()) {
    emit("update:modelValue", searchQuery.value.trim());
  } else {
    emit("update:modelValue", null);
  }
  isOpen.value = false;
};

// Навигация с клавиатуры
const selectNext = () => {
  if (!isOpen.value) {
    isOpen.value = true;
    return;
  }

  if (filtredAuthors.value.length > 0) {
    highlightedIndex.value =
      (highlightedIndex.value + 1) % filtredAuthors.value.length;
    scrollToHighlighted();
  }
};

const selectPrevious = () => {
  if (!isOpen.value) {
    isOpen.value = true;
    return;
  }

  if (filtredAuthors.value.length > 0) {
    highlightedIndex.value =
      highlightedIndex.value <= 0
        ? filtredAuthors.value.length - 1
        : highlightedIndex.value - 1;
    scrollToHighlighted();
  }
};

const selectCurrent = () => {
  if (highlightedIndex.value >= 0 && filtredAuthors.value.length > 0) {
    selectAuthor(filtredAuthors.value[highlightedIndex.value].name);
  } else if (filtredAuthors.value.length === 1) {
    selectAuthor(filtredAuthors.value[0].name);
  } else if (searchQuery.value.trim()) {
    const value = searchQuery.value.trim();
    emit("update:modelValue", value);
    isOpen.value = false;
  }
};

// Переключение дропдауна
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    highlightedIndex.value = -1;
  }
};

// Скролл к выделенному элементу
const scrollToHighlighted = () => {
  nextTick(() => {
    const highlightedElement = document.querySelector(".bg-blue-500");
    if (highlightedElement) {
      highlightedElement.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  });
};

// Закрытие списка при клике вне компонента
const handleClickOutside = (event) => {
  if (!event.target.closest(".relative")) {
    isOpen.value = false;
  }
};

// Следим за изменением modelValue извне (при редактировании)
watch(
  () => props.modelValue,
  (newValue) => {
    searchQuery.value = newValue || "";
  },
  { immediate: true },
);

// Сбрасываем подсветку при изменении списка
watch(filtredAuthors, () => {
  highlightedIndex.value = -1;
});

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});
</script>
