<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4"
      @click.self="handleClose"
    >
      <div
        class="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl max-h-[90vh] flex flex-col"
      >
        <!-- Заголовок -->
        <div
          class="flex-shrink-0 border-b dark:border-gray-700 p-4 flex justify-between items-center"
        >
          <h2 class="text-lg font-semibold dark:text-white">
            {{ bookToEdit?.id ? "Редактировать книгу" : "Добавить книгу" }}
          </h2>
          <IconButton
            icon="✕"
            @click="handleClose"
            class="dark:text-gray-400"
          />
        </div>

        <!-- Контент с прокруткой -->
        <div class="flex-1 overflow-y-auto p-4">
          <!-- Поиск по API (заглушка) -->
          <div class="mb-6">
            <div class="relative">
              <input
                type="text"
                placeholder="Введите название для поиска..."
                class="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 dark:text-white"
                disabled
              />
              <span
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                🔍
              </span>
            </div>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Поиск по Google Books API появится позже
            </p>
          </div>

          <!-- Форма с обложкой слева -->
          <div class="flex gap-4">
            <!-- Обложка слева -->
            <div class="flex-shrink-0">
              <div class="relative">
                <div
                  class="w-24 h-36 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-4xl text-gray-400 dark:text-gray-500 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border-2 border-dashed border-gray-300 dark:border-gray-600"
                  @click="triggerFileInput"
                >
                  <img
                    v-if="coverPreview"
                    :src="coverPreview"
                    class="w-full h-full object-cover"
                    alt="Обложка"
                  />
                  <span v-else>📷</span>
                </div>

                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleFileSelect"
                />

                <button
                  v-if="coverPreview"
                  type="button"
                  class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                  @click="removeCover"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- Поля формы справа -->
            <div class="flex-1 space-y-3">
              <!-- Название -->
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Название <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Введите название"
                />
              </div>

              <!-- Автор -->
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Автор <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.author"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Введите автора"
                />
              </div>
            </div>
          </div>

          <!-- Формат -->
          <div>
            <label
              class="block text-sm mt-4 font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Формат
            </label>
            <div class="flex gap-3">
              <label class="flex items-center">
                <input
                  v-model="form.format"
                  type="radio"
                  value="бумажная"
                  class="mr-2"
                />
                <span class="dark:text-gray-300">📄 Бумажная</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.format"
                  type="radio"
                  value="электронная"
                  class="mr-2"
                />
                <span class="dark:text-gray-300">📱 Электронная</span>
              </label>
            </div>
          </div>

          <!-- Статус книги -->
          <div class="mt-4">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Статус чтения
            </label>
            <div class="flex gap-2 flex-wrap">
              <label
                class="flex-1 px-3 py-2 rounded-lg border cursor-pointer transition-colors"
                :class="[
                  form.status === 'не прочитано'
                    ? 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900 dark:border-yellow-700'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
                ]"
              >
                <input
                  v-model="form.status"
                  type="radio"
                  value="не прочитано"
                  class="hidden"
                />
                <div class="text-center">
                  <span class="text-xs dark:text-gray-300">Не прочитано</span>
                </div>
              </label>

              <label
                class="flex-1 px-3 py-2 rounded-lg border cursor-pointer transition-colors"
                :class="[
                  form.status === 'прочитано'
                    ? 'bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
                ]"
              >
                <input
                  v-model="form.status"
                  type="radio"
                  value="прочитано"
                  class="hidden"
                />
                <div class="text-center">
                  <span class="text-xs dark:text-gray-300">Прочитано</span>
                </div>
              </label>

              <label
                class="flex-1 px-3 py-2 rounded-lg border cursor-pointer transition-colors"
                :class="[
                  form.status === 'брошено'
                    ? 'bg-red-100 border-red-300 dark:bg-red-900 dark:border-red-700'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
                ]"
              >
                <input
                  v-model="form.status"
                  type="radio"
                  value="брошено"
                  class="hidden"
                />
                <div class="text-center">
                  <span class="text-xs dark:text-gray-300">Брошено</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Рейтинг (только если статус "прочитано") -->
          <div v-if="form.status === 'прочитано'" class="mt-4">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Оценка
            </label>
            <div class="flex gap-1 text-2xl">
              <button
                v-for="n in 5"
                :key="n"
                type="button"
                @click="form.rating = n"
                class="focus:outline-none transition-transform hover:scale-110"
                :class="
                  n <= form.rating
                    ? 'text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                "
              >
                ★
              </button>
            </div>
          </div>

          <!-- Описание (на всю ширину) -->
          <div class="mt-4">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Описание
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 dark:text-white"
              placeholder="Краткое описание книги..."
            ></textarea>
          </div>
        </div>

        <!-- Кнопки внизу (фиксированные) -->
        <div class="flex-shrink-0 border-t dark:border-gray-700 p-4">
          <div class="flex gap-2">
            <button
              type="button"
              @click="resetForm"
              class="flex-1 py-2 px-4 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
            >
              Очистить
            </button>
            <button
              type="button"
              @click="handleSubmit"
              class="flex-1 py-2 px-4 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              {{ bookToEdit ? "Сохранить" : "Добавить" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from "vue";
import IconButton from "./IconButton.vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  bookToEdit: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "save"]);

// Состояние формы
const form = reactive({
  title: "",
  author: "",
  format: "бумажная",
  status: "не прочитано",
  rating: 0,
  description: "",
  cover: null,
});

const coverPreview = ref(null);
const fileInput = ref(null);

// Блокировка прокрутки страницы
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  },
);

// Сброс формы
const resetForm = () => {
  form.title = "";
  form.author = "";
  form.format = "бумажная";
  form.status = "не прочитано";
  form.rating = 0;
  form.description = "";
  form.cover = null;
  coverPreview.value = null;
};

// Заполнение формы при редактировании
watch(
  () => props.bookToEdit,
  (book) => {
    if (book && book.id) {
      form.title = book.title || "";
      form.author = book.author || "";
      form.format = book.format || "бумажная";
      form.status = book.status || "не прочитано";
      form.rating = book.rating || 0;
      form.description = book.description || "";
      // Восстанавливаем обложку, если она есть
      if (book.cover) {
        coverPreview.value = book.cover;
        form.cover = book.cover;
      }
    } else {
      resetForm();
    }
  },
  { immediate: true, deep: true },
);

// Закрытие модалки
const handleClose = () => {
  resetForm();
  emit("close");
};

// Отправка формы
const handleSubmit = () => {
  // Валидация
  if (!form.title.trim() || !form.author.trim()) {
    alert("Пожалуйста, заполните название и автора");
    return;
  }

  const bookData = {
    title: form.title.trim(),
    author: form.author.trim(),
    format: form.format,
    status: form.status,
    rating: form.status === "прочитано" ? form.rating : 0,
    description: form.description.trim(),
    cover: coverPreview.value,
    isFavorite: props.bookToEdit?.isFavorite || false,
  };

  // Если редактируем, добавляем id
  if (props.bookToEdit?.id) {
    bookData.id = props.bookToEdit.id;
  }

  emit("save", bookData);
  handleClose();
};

// Загрузка обложки
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Создаем превью
    const reader = new FileReader();
    reader.onload = (e) => {
      coverPreview.value = e.target.result;
      form.cover = e.target.result; // Сохраняем в форме
    };
    reader.readAsDataURL(file);
  }
};

const removeCover = () => {
  form.cover = null;
  coverPreview.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// Очистка при размонтировании
onUnmounted(() => {
  document.body.classList.remove("modal-open");
});
</script>
