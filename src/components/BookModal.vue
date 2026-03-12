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
        <ModalHeader
          :title="bookToEdit?.id ? 'Редактировать книгу' : 'Добавить книгу'"
          @close="handleClose"
        />

        <div class="flex-1 overflow-y-auto p-4">
          <!--Форма -->
          <div class="flex gap-4 mt-4">
            <CoverUploader
              v-model:coverPreview="coverPreview"
              v-model:coverFile="coverFile"
              v-model:originalImage="originalCover"
              :bookId="bookToEdit?.id"
              @remove="removeCover"
            />

            <div class="flex-1 space-y-4">
              <BookFormFields v-model:title="form.title" />
              <AuthorSelect v-model="form.author" />
              <PublisherSelect v-model="form.publisher" />
            </div>
          </div>

          <BookFormat v-model="form.format" />
          <BookStatus v-model="form.status" />
          <BookRating
            v-if="form.status === 'прочитано'"
            v-model="form.rating"
          />
          <BookDescription v-model="form.description" />
        </div>

        <ModalActions
          :is-edit="!!bookToEdit?.id"
          @reset="resetForm"
          @submit="handleSubmit"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, onUnmounted } from "vue";
import ModalHeader from "./modal/ModalHeader.vue";
import ModalActions from "./modal/ModalActions.vue";
import CoverUploader from "./modal/CoverUploader.vue";
import BookFormFields from "./modal/BookForm.vue";
import BookFormat from "./modal/BookFormat.vue";
import BookStatus from "./modal/BookStatus.vue";
import BookRating from "./modal/BookRating.vue";
import BookDescription from "./modal/BookDescription.vue";
import PublisherSelect from "./modal/PublisherSelect.vue";
import AuthorSelect from "./modal/AuthorSelect.vue";

const props = defineProps({
  isOpen: Boolean,
  bookToEdit: Object,
});

const emit = defineEmits(["close", "save"]);

// Состояния для обложки
const coverPreview = ref(null);
const coverFile = ref(null);
const originalCover = ref(null);

// Форма
const form = reactive({
  title: "",
  author: "",
  format: "бумажная",
  publisher: "",
  status: "не прочитано",
  rating: 0,
  description: "",
});

// Сброс формы
const resetForm = () => {
  form.title = "";
  form.author = "";
  form.format = "бумажная";
  form.status = "не прочитано";
  form.rating = 0;
  form.description = "";
  form.publisher = "";
  coverPreview.value = null;
  coverFile.value = null;
  originalCover.value = null;
};

// Заполнение при редактировании
watch(
  () => props.bookToEdit,
  (book) => {
    if (book?.id) {
      form.title = book.title || "";
      form.format = book.format || "бумажная";
      form.status = book.status || "не прочитано";
      form.rating = book.rating || 0;
      form.description = book.description || "";

      if (book.author) {
        if (typeof book.author === "object" && book.author !== null) {
          form.author = book.author.name;
        } else {
          form.author = String(book.author);
        }
      } else {
        form.author = "";
      }

      // Обработка издательства
      if (book.publisher) {
        if (typeof book.publisher === "object" && book.publisher !== null) {
          form.publisher = book.publisher.name;
        } else {
          form.publisher = String(book.publisher);
        }
      } else {
        form.publisher = "";
      }

      // Загружаем обложку
      if (book.cover) {
        coverPreview.value = book.cover;
      }

      // Здесь можно загрузить originalCover из книги, если оно есть
      if (book.originalCover) {
        originalCover.value = book.originalCover;
      }
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

// Блокировка скролла
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

// Закрытие модалки
const handleClose = () => {
  resetForm();
  emit("close");
};

// Отправка формы
const handleSubmit = () => {
  const bookData = {
    title: form.title.trim(),
    author: form.author?.trim() || null,
    format: form.format,
    status: form.status,
    rating: form.status === "прочитано" ? form.rating : 0,
    description: form.description.trim(),
    cover: coverPreview.value,
    originalCover: originalCover.value,
    publisher: form.publisher?.trim() || null,
    isFavorite: props.bookToEdit?.isFavorite || false,
  };

  if (props.bookToEdit?.id) {
    bookData.id = props.bookToEdit.id;
  }

  emit("save", bookData);
  handleClose();
};

// Удаление обложки
const removeCover = () => {
  coverPreview.value = null;
  coverFile.value = null;
  originalCover.value = null;
};

onUnmounted(() => {
  document.body.classList.remove("modal-open");
});
</script>
