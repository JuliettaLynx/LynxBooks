<template>
  <div
    class="min-h-screen bg-gray-200 dark:bg-gray-900 transition-colors duration-200"
  >
    <!-- Шапка -->
    <div
      class="sticky top-0 bg-gray-100 dark:bg-gray-800 z-20 border-b dark:border-gray-700 transition-colors duration-200"
    >
      <div class="p-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold dark:text-white">Библиотека</h1>
          <div class="flex gap-1">
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

            <!-- Иконка профиля -->
            <UserProfile />
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

    <!-- Индикатор загрузки или ошибка -->
    <div v-if="libraryStore.loading" class="p-4 text-center">
      <div class="inline-block text-2xl animate-spin">⌛</div>
      <p class="text-gray-500 dark:text-gray-400 mt-2">Загрузка...</p>
    </div>

    <div v-else-if="libraryStore.error" class="p-4 text-center">
      <p class="text-red-500 dark:text-red-400">
        Ошибка: {{ libraryStore.error }}
      </p>
      <button
        @click="libraryStore.loadBooks"
        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Повторить
      </button>
    </div>

    <!-- Список книг -->
    <div v-else class="p-4">
      <div v-if="filteredBooks.length === 0" class="text-center py-8">
        <span class="text-6xl mb-4 block">📚</span>
        <p class="text-gray-500 dark:text-gray-400">Книги не найдены</p>
        <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
          {{
            libraryStore.books.length === 0
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
          @favorite="handleToggleFavorite"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- Кнопка добавления -->
    <IconButton
      icon="+"
      variant="primary"
      class="fixed z-20 right-4 bottom-20 w-14 h-14 bg-blue-600 dark:bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-2xl flex items-center justify-center transition-colors duration-200"
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
import { ref, computed, watch, onMounted } from "vue";
import { auth } from "../firebase/config";
import { useDebounceFn } from "@vueuse/core";
import { useLibraryStore } from "../stores/library";
import IconButton from "../components/IconButton.vue";
import SearchInput from "../components/SearchInput.vue";
import BookCard from "../components/BookCard.vue";
import BookModal from "../components/BookModal.vue";
import UserProfile from "../components/UserProfile.vue";

const libraryStore = useLibraryStore();

// Состояние UI
const viewMode = ref("grid"); // 'grid' или 'tile'
const searchQuery = ref("");
const debouncedSearch = ref("");
const sortMode = ref(0); // 0: название А-Я, 1: название Я-А, 2: автор А-Я, 3: автор Я-А
const filterMode = ref(0); // 0: все, 1: избранные, 2: прочитано, 3: не прочитано, 4: брошено
const isModalOpen = ref(false);
const editingBook = ref(null);

onMounted(() => {
  // Если пользователь вошел, а данные ещё не синхронизированы
  if (auth.currentUser) {
    libraryStore.initSync(auth.currentUser.uid);
  }
});

// Иконки для сортировки
const sortIcons = ["🔤↑", "🔤↓", "👤↑", "👤↓"];
const sortIcon = computed(() => sortIcons[sortMode.value]);

// Иконки для фильтра
const filterIcons = ["📚", "❤️", "✅", "📖", "❌"];
const filterIcon = computed(() => filterIcons[filterMode.value]);

// Методы управления модалкой
const openModal = () => {
  editingBook.value = null;
  isModalOpen.value = true;
};

const openEditModal = (book) => {
  editingBook.value = { ...book };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  editingBook.value = null;
};

// Переключение режима отображения
const toggleViewMode = () => {
  viewMode.value = viewMode.value === "grid" ? "tile" : "grid";
};

// Циклическое переключение сортировки
const cycleSortMode = () => {
  sortMode.value = (sortMode.value + 1) % 4;
};

// Циклическое переключение фильтра
const cycleFilterMode = () => {
  filterMode.value = (filterMode.value + 1) % 5;
};

// Debounce для поиска
const updateDebouncedSearch = useDebounceFn((value) => {
  debouncedSearch.value = value;
}, 300);

watch(searchQuery, (value) => {
  updateDebouncedSearch(value);
});

// Применение фильтра
const filteredByStatus = computed(() => {
  let filtered = [...libraryStore.books];

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
        return (a.title || "").localeCompare(b.title || "");
      case 1: // название Я-А
        return (b.title || "").localeCompare(a.title || "");
      case 2: // автор А-Я
        const authorA = a.author || "";
        const authorB = b.author || "";
        return authorA.localeCompare(authorB);
      case 3: // автор Я-А
        const authorA2 = a.author || "";
        const authorB2 = b.author || "";
        return authorB2.localeCompare(authorA2);
      default:
        return 0;
    }
  });

  return sorted;
});

// Обработчики действий с книгами
const handleToggleFavorite = async (book) => {
  await libraryStore.toggleFavorite(book);
};

const handleDelete = async (book) => {
  if (confirm(`Удалить книгу "${book.title}"?`)) {
    await libraryStore.deleteBook(book.id);
  }
};

// Сохранение книги
const saveBook = async (bookData) => {
  if (bookData.id) {
    // Редактирование
    await libraryStore.updateBook(bookData.id, bookData);
  } else {
    // Добавление
    await libraryStore.addBook(bookData);
  }
};
</script>
