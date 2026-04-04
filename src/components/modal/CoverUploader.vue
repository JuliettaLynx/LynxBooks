<template>
  <div class="flex-shrink-0">
    <div class="relative">
      <!-- Превью или заглушка -->
      <div
        class="w-28 dark:bg-border-dark/40 rounded-lg flex items-center justify-center text-4xl text-gray-400 dark:text-gray-500 cursor-pointer hover:bg-purple-700/10 dark:hover:bg-border-dark transition-colors border-2 border-dashed border-border dark:border-border-dark overflow-hidden"
        style="aspect-ratio: 2/3"
        @click="openCropperModal"
      >
        <img
          v-if="coverPreview"
          :src="coverPreview"
          class="absolute inset-0 w-full h-full object-cover"
          alt="Обложка"
        />
        <span v-else>📷</span>
      </div>

      <!-- Кнопка удаления -->
      <button
        v-if="coverPreview"
        type="button"
        class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
        @click.stop="handleRemove"
      >
        ✕
      </button>
    </div>

    <!-- Модальное окно для обрезки изображения -->
    <Teleport to="body">
      <div
        v-if="showCropper"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 dark:bg-opacity-70"
        @click.self="closeCropperModal"
      >
        <div
          class="bg-white dark:bg-bg-secondary-dark rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh]"
        >
          <!-- Заголовок -->
          <div
            class="flex items-center justify-between p-4 border-b border-border dark:border-border-dark"
          >
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Редактировать обложку
            </h2>
            <button
              @click="closeCropperModal"
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <!-- Кнопка загрузки нового изображения -->
          <div class="px-4 pt-2 flex items-center gap-2">
            <button @click="uploadNewImage" class="text-sm text-accent">
              Загрузить изображение
            </button>
          </div>

          <!-- Область кроппера -->
          <div class="flex-1 overflow-auto p-4">
            <div
              class="relative bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center min-h-[400px]"
            >
              <cropper
                v-if="originalImageSrc"
                ref="cropperRef"
                class="cropper"
                :src="originalImageSrc"
                :stencil-props="stencilProps"
                :resize-image="resizeImageConfig"
                image-restriction="none"
                @ready="handleCropperReady"
                @change="handleCropChange"
              />
            </div>
          </div>

          <!-- Действия -->
          <div
            class="flex justify-end gap-2 p-4 border-t border-border dark:border-border-dark"
          >
            <button
              @click="closeCropperModal"
              class="px-4 py-2 dark:bg-border-dark/40 border border-border dark:border-border-dark text-gray-700 dark:text-gray-300 hover:bg-purple-700/10 dark:hover:bg-border-dark rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              @click="applyCrop"
              class="px-4 py-2 bg-accent/60 hover:bg-accent/80 text-white rounded-lg transition-colors"
            >
              Применить
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { Cropper } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";
import { booksDB } from "../../db/index.js";

// Пропсы и эмиты
const props = defineProps({
  coverPreview: String,
  coverFile: [String, File],
  originalImage: String,
  bookId: {
    type: [Number, String],
    default: null,
  },
});

const emit = defineEmits([
  "update:coverPreview",
  "update:coverFile",
  "update:originalImage",
  "remove",
]);

// Состояния
const showCropper = ref(false);
const originalImageSrc = ref(null);
const cropperRef = ref(null);
const currentCoordinates = ref(null);
const isLoading = ref(false);

// Конфиги для cropper
const stencilProps = {
  aspectRatio: 2 / 3,
  movable: true,
  resizable: true,
  aspectRatioLockEnabled: true,
};

const resizeImageConfig = {
  adjustStencil: false,
  scalable: true,
  minScale: 0.3,
  maxScale: 5,
  wheel: true,
};

// Константы
const MAX_SIZE = 2 * 1024 * 1024; // 2 МБ
const TARGET_SIZE = { width: 400, height: 600 };

// Загрузка оригинала из IndexedDB
const loadOriginalFromDB = async () => {
  if (!props.bookId) return;

  isLoading.value = true;
  try {
    const book = await booksDB.get(props.bookId);
    if (book?.originalCover) {
      originalImageSrc.value = book.originalCover;
      emit("update:originalImage", book.originalCover);
      console.log("Оригинал загружен из IndexedDB");
    }
  } catch (error) {
    console.error("Ошибка загрузки из IndexedDB:", error);
  } finally {
    isLoading.value = false;
  }
};

// Сохранение оригинала в IndexedDB
const saveOriginalToDB = async (imageData) => {
  if (!props.bookId) return;

  try {
    await booksDB.update(props.bookId, {
      originalCover: imageData,
    });
    console.log("Оригинал сохранен в IndexedDB");
  } catch (error) {
    console.error("Ошибка сохранения в IndexedDB:", error);
  }
};

// Удаление оригинала из IndexedDB
const removeOriginalFromDB = async () => {
  if (!props.bookId) return;

  try {
    await booksDB.update(props.bookId, {
      originalCover: null,
    });
    console.log("Оригинал удален из IndexedDB");
  } catch (error) {
    console.error("Ошибка удаления из IndexedDB:", error);
  }
};

// При монтировании загружаем сохраненный оригинал
onMounted(() => {
  loadOriginalFromDB();
});

// Следим за изменением bookId
watch(
  () => props.bookId,
  () => {
    loadOriginalFromDB();
  },
);

// Валидация изображения
const validateImage = (file, base64) => {
  if (file?.size > MAX_SIZE) {
    alert("Изображение слишком большое. Максимальный размер 5 МБ");
    return false;
  }

  const sizeInMB = (base64.length * 3) / 4 / (1024 * 1024);
  if (sizeInMB > 5) {
    alert("Изображение слишком большое после конвертации");
    return false;
  }

  return true;
};

// Загрузка нового изображения
const uploadNewImage = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event) => {
      const imageData = event.target.result;
      if (!validateImage(file, imageData)) return;

      originalImageSrc.value = imageData;

      // Сохраняем в IndexedDB
      await saveOriginalToDB(imageData);

      showCropper.value = true;
    };

    reader.readAsDataURL(file);
  };

  input.click();
};

// Открытие модального окна
const openCropperModal = () => {
  if (props.originalImage || props.coverPreview) {
    originalImageSrc.value = props.originalImage || props.coverPreview;
    showCropper.value = true;
  } else {
    uploadNewImage();
  }
};

// Применить обрезку
const applyCrop = async () => {
  const cropper = cropperRef.value;
  if (!cropper) return;

  const { canvas } = cropper.getResult();
  if (!canvas) return;

  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = TARGET_SIZE.width;
  finalCanvas.height = TARGET_SIZE.height;
  const ctx = finalCanvas.getContext("2d");

  const scale = Math.max(
    TARGET_SIZE.width / canvas.width,
    TARGET_SIZE.height / canvas.height,
  );

  const newWidth = canvas.width * scale;
  const newHeight = canvas.height * scale;

  ctx.drawImage(
    canvas,
    (TARGET_SIZE.width - newWidth) / 2,
    (TARGET_SIZE.height - newHeight) / 2,
    newWidth,
    newHeight,
  );

  const croppedImage = finalCanvas.toDataURL("image/jpeg", 0.9);

  emit("update:originalImage", originalImageSrc.value);
  emit("update:coverPreview", croppedImage);
  emit("update:coverFile", croppedImage);

  closeCropperModal();
};

// Обработчики
const handleCropChange = ({ coordinates }) => {
  currentCoordinates.value = coordinates;
};

const handleCropperReady = () => {
  console.log("Кроппер готов");
};

const closeCropperModal = () => {
  showCropper.value = false;
  currentCoordinates.value = null;
};

const handleRemove = async () => {
  emit("remove");
  emit("update:coverPreview", null);
  emit("update:coverFile", null);
  emit("update:originalImage", null);

  originalImageSrc.value = null;
  currentCoordinates.value = null;

  // Удаляем из IndexedDB
  await removeOriginalFromDB();
};

// Вотчер для props.originalImage
watch(
  () => props.originalImage,
  (val) => {
    if (val) originalImageSrc.value = val;
  },
  { immediate: true },
);
</script>

<style scoped>
.cropper {
  width: 100%;
  height: 400px;
  background: transparent;
}

/* Стили для рамки */
:deep(.vue-advanced-cropper__stencil) {
  border: 2px solid #3b82f6;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}

/* Ручки изменения размера */
:deep(.vue-advanced-cropper__handler) {
  background-color: white;
  border: 2px solid #3b82f6;
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

/* Темная тема */
:deep(.dark .vue-advanced-cropper__stencil) {
  border-color: #60a5fa;
}

:deep(.dark .vue-advanced-cropper__handler) {
  background-color: #1f2937;
  border-color: #60a5fa;
}
</style>
