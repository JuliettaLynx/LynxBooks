<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
  >
    <!-- Шапка -->
    <div
      class="sticky top-0 bg-white dark:bg-gray-800 z-10 border-b dark:border-gray-700 transition-colors duration-200"
    >
      <div class="p-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold dark:text-white">Библиотека</h1>
          <div class="flex gap-2">
            <!-- Кнопка сортировки -->
            <IconButton
              :icon="sortIcon"
              :variant="'primary'"
              @click="cycleSortMode"
              class="text-xl dark:text-gray-300"
            />

            <!-- Кнопка фильтра -->
            <IconButton
              :icon="filterIcon"
              :variant="'primary'"
              @click="cycleFilterMode"
              class="text-xl dark:text-gray-300"
            />

            <!-- Кнопка переключения режима отображения -->
            <IconButton
              :icon="viewMode === 'grid' ? '⊞' : '☰'"
              :variant="'primary'"
              @click="toggleViewMode"
              class="text-xl dark:text-gray-300"
            />

            <!-- Кнопка переключения темы -->
            <ThemeToggle />
          </div>
        </div>

        <!-- Поиск с debounce -->
        <SearchInput
          v-model="searchQuery"
          placeholder="Поиск по названию или автору..."
          class="mt-3"
        />
      </div>
    </div>

    <!-- Список книг -->
    <div class="p-4">
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin text-2xl">⌛</div>
        <p class="text-gray-500 mt-2">Загрузка...</p>
      </div>

      <div v-else-if="filteredBooks.length === 0" class="text-center py-8">
        <span class="text-6xl mb-4 block">📚</span>
        <p class="text-gray-500">Книги не найдены</p>
        <p class="text-sm text-gray-400 mt-2">
          {{
            books.length === 0
              ? "Добавьте первую книгу"
              : "Попробуйте изменить параметры поиска"
          }}
        </p>
      </div>

      <div
        v-else
        :class="{
          'grid grid-cols-2 gap-3': viewMode === 'tile',
          'flex flex-col gap-3': viewMode === 'grid',
        }"
      >
        <BookCard
          v-for="book in filteredBooks"
          :key="book.id"
          :book="book"
          :is-grid="viewMode === 'grid'"
          @edit="openEditModal"
          @favorite="toggleFavorite"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- Кнопка добавления -->
    <IconButton
      icon="+"
      variant="primary"
      class="fixed right-4 bottom-20 w-14 h-14 bg-blue-600 dark:bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-2xl flex items-center justify-center transition-colors duration-200"
      @click="openModal"
    />

    <!-- Модальное окно -->
    <BookModal
      :is-open="isModalOpen"
      :book-to-edit="editingBook"
      @close="closeModal"
      @save="saveBook"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import IconButton from "../components/IconButton.vue";
import SearchInput from "../components/SearchInput.vue";
import BookCard from "../components/BookCard.vue";
import BookModal from "../components/BookModal.vue";
import ThemeToggle from "../components/ThemeToggle.vue";

// Состояние
const viewMode = ref("grid"); // 'grid' или 'tile'
const searchQuery = ref("");
const debouncedSearch = ref("");
const sortMode = ref(0); // 0: название А-Я, 1: название Я-А, 2: автор А-Я, 3: автор Я-А
const filterMode = ref(0); // 0: все, 1: избранные, 2: прочитано, 3: не прочитано, 4: брошено
const isModalOpen = ref(false);
const editingBook = ref(null);
const loading = ref(false);

// Иконки для сортировки
const sortIcons = ["🔤↑", "🔤↓", "👤↑", "👤↓"];
const sortIcon = computed(() => sortIcons[sortMode.value]);

// Иконки для фильтра
const filterIcons = ["📚", "⭐", "✅", "📖", "❌"];
const filterIcon = computed(() => filterIcons[filterMode.value]);

// Методы управления модалкой
const openAddModal = () => {
  editingBook.value = null;
  isModalOpen.value = true;
};

const openEditModal = (book) => {
  editingBook.value = { ...book }; // Копируем, чтобы не менять оригинал до сохранения
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  editingBook.value = null;
};

// Метод для переключения режима отображения
const toggleViewMode = () => {
  viewMode.value = viewMode.value === "grid" ? "tile" : "grid";
};

// Циклическое переключение сортировки
const cycleSortMode = () => {
  sortMode.value = (sortMode.value + 1) % 4; // 4 режима сортировки
};

// Циклическое переключение фильтра
const cycleFilterMode = () => {
  filterMode.value = (filterMode.value + 1) % 5; // 5 режимов фильтра
};

// Debounce для поиска
const updateDebouncedSearch = useDebounceFn((value) => {
  debouncedSearch.value = value;
}, 300);

watch(searchQuery, (value) => {
  updateDebouncedSearch(value);
});

// Тестовые данные
const books = ref([
  {
    id: 1,
    title: "Война и мир",
    author: "Лев Толстой",
    format: "📄",
    status: "прочитано",
    rating: 5,
    isFavorite: true,
  },
  {
    id: 2,
    title: "Преступление и наказание",
    author: "Фёдор Достоевский",
    format: "📱",
    status: "не прочитано",
    isFavorite: false,
  },
  {
    id: 3,
    title: "Мастер и Маргарита",
    author: "Михаил Булгаков",
    format: "📄",
    status: "не прочитано",
    isFavorite: false,
  },
  {
    id: 4,
    title: "1984",
    author: "Джордж Оруэлл",
    format: "📱",
    status: "прочитано",
    rating: 4,
    isFavorite: true,
  },
  {
    id: 5,
    title: "Улисс",
    author: "Джеймс Джойс",
    format: "📄",
    status: "брошено",
    isFavorite: false,
  },
  {
    id: 6,
    title: "Анна Каренина",
    author: "Лев Толстой",
    format: "📄",
    status: "прочитано",
    rating: 5,
    isFavorite: true,
  },
  {
    id: 7,
    title: "Идиот",
    author: "Фёдор Достоевский",
    format: "📱",
    status: "не прочитано",
    isFavorite: false,
  },
  {
    id: 8,
    title: "Собачье сердце",
    author: "Михаил Булгаков",
    format: "📄",
    status: "прочитано",
    rating: 5,
    isFavorite: false,
  },
  {
    id: 9,
    title: "Скотный двор",
    author: "Джордж Оруэлл",
    format: "📱",
    status: "не прочитано",
    isFavorite: false,
  },
  {
    id: 10,
    title: "Портрет художника в юности",
    author: "Джеймс Джойс",
    format: "📱",
    status: "брошено",
    isFavorite: false,
  },
]);

// Применение фильтра
const filteredByStatus = computed(() => {
  let filtered = [...books.value];

  switch (filterMode.value) {
    case 1: // избранные
      filtered = filtered.filter((book) => book.isFavorite);
      break;
    case 2: // прочитано
      filtered = filtered.filter((book) => book.status === "прочитано");
      break;
    case 3: // не прочитано
      filtered = filtered.filter((book) => book.status === "не прочитано");
      break;
    case 4: // брошено
      filtered = filtered.filter((book) => book.status === "брошено");
      break;
    case 0: // все
    default:
      // все книги
      break;
  }

  return filtered;
});

// Поиск по названию и автору
const searched = computed(() => {
  if (!debouncedSearch.value) return filteredByStatus.value;

  const query = debouncedSearch.value.toLowerCase();
  return filteredByStatus.value.filter(
    (book) =>
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query),
  );
});

// Применение сортировки
const filteredBooks = computed(() => {
  const sorted = [...searched.value];

  sorted.sort((a, b) => {
    switch (sortMode.value) {
      case 0: // название А-Я
        return a.title.localeCompare(b.title);
      case 1: // название Я-А
        return b.title.localeCompare(a.title);
      case 2: // автор А-Я
        return a.author.localeCompare(b.author);
      case 3: // автор Я-А
        return b.author.localeCompare(a.author);
      default:
        return 0;
    }
  });

  return sorted;
});

const toggleFavorite = (book) => {
  book.isFavorite = !book.isFavorite;
};

const handleDelete = (book) => {
  if (confirm(`Удалить книгу "${book.title}"?`)) {
    books.value = books.value.filter((b) => b.id !== book.id);
  }
};

// Сохранение книги
const saveBook = (bookData) => {
  if (bookData.id) {
    // Редактирование - заменяем всю книгу
    const index = books.value.findIndex((b) => b.id === bookData.id);
    if (index !== -1) {
      books.value[index] = bookData;
    }
  } else {
    // Добавление
    const newBook = {
      ...bookData,
      id: Date.now(), // Простой способ генерации id
    };
    books.value.push(newBook);
  }
};

const openModal = () => {
  isModalOpen.value = true;
};

// Имитация загрузки
setTimeout(() => {
  loading.value = false;
}, 500);
</script>
