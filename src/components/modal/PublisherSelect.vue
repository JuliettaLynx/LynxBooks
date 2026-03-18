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
        class="w-full mt-1.5 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 dark:text-white"
      />

      <!-- Стрелка вниз -->
      <button
        @click="toggleDropdown"
        @mousedown.prevent
        type="button"
        class="absolute right-2 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
      v-if="
        isOpen && (startsWithResults.length > 0 || containsResults.length > 0)
      "
      class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 dark:text-gray-100 border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <ul>
        <!-- Группа "Начинается с" -->
        <li
          v-if="startsWithResults.length > 0"
          class="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 sticky top-0"
        >
          Начинается с "{{ searchQuery }}"
        </li>
        <li
          v-for="(publisher, index) in startsWithResults"
          :key="publisher.id"
          @mousedown.prevent="selectPublisher(publisher.name)"
          @mouseenter="highlightedIndex = getAbsoluteIndex(index, 'starts')"
          :class="[
            'px-4 py-2 cursor-pointer transition-colors',
            highlightedIndex === getAbsoluteIndex(index, 'starts')
              ? 'bg-blue-500 text-white'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700',
          ]"
        >
          {{ publisher.name }}
        </li>

        <!-- Разделитель, если есть обе группы -->
        <li
          v-if="startsWithResults.length > 0 && containsResults.length > 0"
          class="border-t border-gray-200 dark:border-gray-700 my-1"
        ></li>

        <!-- Группа "Содержит" -->
        <li
          v-if="containsResults.length > 0"
          class="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 sticky top-0"
        >
          Содержит "{{ searchQuery }}"
        </li>
        <li
          v-for="(publisher, index) in containsResults"
          :key="`contains-${publisher.id}`"
          @mousedown.prevent="selectPublisher(publisher.name)"
          @mouseenter="highlightedIndex = getAbsoluteIndex(index, 'contains')"
          :class="[
            'px-4 py-2 cursor-pointer transition-colors',
            highlightedIndex === getAbsoluteIndex(index, 'contains')
              ? 'bg-blue-500 text-white'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700',
          ]"
        >
          {{ publisher.name }}
        </li>
      </ul>
    </div>

    <!-- Сообщение, если ничего не найдено, но есть введенный текст -->
    <div
      v-else-if="
        isOpen &&
        searchQuery &&
        startsWithResults.length === 0 &&
        containsResults.length === 0
      "
      class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 dark:text-gray-100 border border-gray-300 rounded-lg shadow-lg p-4 text-gray-500 text-center"
    >
      Будет добавлено:
      <span class="font-medium text-blue-500">"{{ searchQuery }}"</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { publishersList } from "../../constants/publishers";

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
const selectPublisher = (publisherName) => {
  isSelecting.value = true; // Устанавливаем флаг, что идет выбор из списка
  searchQuery.value = publisherName;
  isOpen.value = false;
  emit("update:modelValue", publisherName);

  // Сбрасываем флаг через небольшую задержку
  setTimeout(() => {
    isSelecting.value = false;
  }, 100);
};

// Фильтрация издательств с сортировкой по группам
const filteredPublishers = computed(() => {
  if (!searchQuery.value) {
    return {
      startsWith: publishersList,
      contains: [],
    };
  }

  const query = searchQuery.value.toLowerCase().trim();

  const startsWith = publishersList.filter((publisher) =>
    publisher.name.toLowerCase().startsWith(query),
  );

  const contains = publishersList.filter((publisher) => {
    const name = publisher.name.toLowerCase();
    return name.includes(query) && !name.startsWith(query);
  });

  // Сортируем каждую группу по алфавиту
  const sortByName = (a, b) => a.name.localeCompare(b.name);

  return {
    startsWith: [...startsWith].sort(sortByName),
    contains: [...contains].sort(sortByName),
  };
});

// Вычисляемые свойства для каждой группы
const startsWithResults = computed(() => filteredPublishers.value.startsWith);
const containsResults = computed(() => filteredPublishers.value.contains);

// Получение абсолютного индекса для выделения
const getAbsoluteIndex = (index, group) => {
  if (group === "starts") {
    return index;
  } else {
    return startsWithResults.value.length + index;
  }
};

// Получение элемента по абсолютному индексу
const getItemByAbsoluteIndex = (index) => {
  const startsCount = startsWithResults.value.length;

  if (index < startsCount) {
    return startsWithResults.value[index];
  } else {
    return containsResults.value[index - startsCount];
  }
};

// Общее количество отфильтрованных элементов
const totalFilteredCount = computed(
  () => startsWithResults.value.length + containsResults.value.length,
);

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

  if (totalFilteredCount.value > 0) {
    highlightedIndex.value =
      (highlightedIndex.value + 1) % totalFilteredCount.value;
    scrollToHighlighted();
  }
};

const selectPrevious = () => {
  if (!isOpen.value) {
    isOpen.value = true;
    return;
  }

  if (totalFilteredCount.value > 0) {
    highlightedIndex.value =
      highlightedIndex.value <= 0
        ? totalFilteredCount.value - 1
        : highlightedIndex.value - 1;
    scrollToHighlighted();
  }
};

const selectCurrent = () => {
  if (highlightedIndex.value >= 0 && totalFilteredCount.value > 0) {
    const selectedItem = getItemByAbsoluteIndex(highlightedIndex.value);
    selectPublisher(selectedItem.name);
  } else if (totalFilteredCount.value === 1) {
    const selectedItem = getItemByAbsoluteIndex(0);
    selectPublisher(selectedItem.name);
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
watch([startsWithResults, containsResults], () => {
  highlightedIndex.value = -1;
});

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});
</script>
