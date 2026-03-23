<template>
  <div class="flex-shrink-0">
    <div class="relative">
      <!-- Превью или заглушка -->
      <div
        class="w-28 h-28 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-4xl text-gray-400 dark:text-gray-500 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden"
        @click="openCropperModal"
      >
        <img
          v-if="avatarPreview"
          :src="avatarPreview"
          class="absolute rounded-full inset-0 w-full h-full object-cover"
          alt="Аватар"
        />
        <span v-else class="text-gray-400 dark:text-gray-500">
          {{ initials }}
        </span>
      </div>

      <!-- Кнопка удаления -->
      <button
        v-if="avatarPreview"
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
          class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh]"
        >
          <!-- Заголовок -->
          <div
            class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
          >
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Редактировать аватар
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
            <button
              @click="uploadNewImage"
              class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
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
                image-restriction="stencil"
                @ready="handleCropperReady"
                @change="handleCropChange"
              />
            </div>
          </div>

          <!-- Действия -->
          <div
            class="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700"
          >
            <button
              @click="closeCropperModal"
              class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              @click="applyCrop"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
import { ref, computed, watch, onMounted } from "vue";
import { Cropper } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";
import { usersDB } from ".././db/index";

// Пропсы и эмиты
const props = defineProps({
  avatarPreview: String,
  avatarFile: [String, File],
  originalImage: String,
  userId: {
    type: [Number, String],
    default: null,
  },
  displayName: String,
  email: String,
});

const emit = defineEmits([
  "update:avatarPreview",
  "update:avatarFile",
  "update:originalImage",
  "remove",
]);

// Инициалы для заглушки
const initials = computed(() => {
  if (props.displayName) return props.displayName.charAt(0).toUpperCase();
  if (props.email) return props.email.charAt(0).toUpperCase();
  return "?";
});

// Состояния
const showCropper = ref(false);
const originalImageSrc = ref(null);
const cropperRef = ref(null);
const currentCoordinates = ref(null);
const isLoading = ref(false);

// Конфиги для cropper
const stencilProps = {
  aspectRatio: 1,
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
const MAX_SIZE = 1 * 1024 * 1024; // 1 МБ для аватара
const TARGET_SIZE = { width: 200, height: 200 }; // 200x200 для аватара

// Загрузка оригинала из IndexedDB
const loadOriginalFromDB = async () => {
  if (!props.userId) return;

  isLoading.value = true;
  try {
    const user = await usersDB.get(props.userId);
    if (user?.originalAvatar) {
      originalImageSrc.value = user.originalAvatar;
      emit("update:originalImage", user.originalAvatar);
      console.log("Оригинал аватара загружен из IndexedDB");
    }
  } catch (error) {
    console.error("Ошибка загрузки аватара из IndexedDB:", error);
  } finally {
    isLoading.value = false;
  }
};

// Сохранение оригинала в IndexedDB
const saveOriginalToDB = async (imageData) => {
  if (!props.userId) return;

  try {
    const existing = await usersDB.get(props.userId);
    if (existing) {
      await usersDB.update(props.userId, {
        originalAvatar: imageData,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await usersDB.add({
        userId: props.userId,
        originalAvatar: imageData,
        displayName: props.displayName || "",
        email: props.email || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    console.log("Оригинал аватара сохранен в IndexedDB");
  } catch (error) {
    console.error("Ошибка сохранения аватара в IndexedDB:", error);
  }
};

// Удаление оригинала из IndexedDB
const removeOriginalFromDB = async () => {
  if (!props.userId) return;

  try {
    const existing = await usersDB.get(props.userId);
    if (existing) {
      await usersDB.update(props.userId, {
        originalAvatar: null,
        updatedAt: new Date().toISOString(),
      });
    }
    console.log("Оригинал аватара удален из IndexedDB");
  } catch (error) {
    console.error("Ошибка удаления аватара из IndexedDB:", error);
  }
};

// При монтировании загружаем сохраненный оригинал
onMounted(() => {
  loadOriginalFromDB();
});

// Следим за изменением userId
watch(
  () => props.userId,
  () => {
    loadOriginalFromDB();
  },
);

// Валидация изображения
const validateImage = (file, base64) => {
  if (file?.size > MAX_SIZE) {
    alert("Изображение слишком большое. Максимальный размер 2 МБ");
    return false;
  }

  const sizeInMB = (base64.length * 3) / 4 / (1024 * 1024);
  if (sizeInMB > 2) {
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
  if (props.originalImage || props.avatarPreview) {
    originalImageSrc.value = props.originalImage || props.avatarPreview;
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
  emit("update:avatarPreview", croppedImage);
  emit("update:avatarFile", croppedImage);

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
  emit("update:avatarPreview", null);
  emit("update:avatarFile", null);
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
  border-radius: 50%;
}

/* Ручки изменения размера */
:deep(.vue-advanced-cropper__handler) {
  background-color: white;
  border: 2px solid #3b82f6;
  width: 12px;
  height: 12px;
  border-radius: 50%;
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
