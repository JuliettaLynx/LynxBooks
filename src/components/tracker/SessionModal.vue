<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4"
      @click.self="handleClose"
    >
      <div
        ref="modalRef"
        class="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl max-h-[90vh] flex flex-col"
      >
        <ModalHeader
          :title="
            sessionToEdit?.id ? 'Редактировать сессию' : 'Добавить сессию'
          "
          @close="handleClose"
        />

        <div class="flex-1 overflow-y-auto p-4">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Выбор книги (только для добавления) -->
            <div
              v-if="!sessionToEdit?.id"
              class="relative"
              ref="dropdownContainerRef"
            >
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Книга
              </label>

              <!-- Кастомный селект -->
              <div class="relative">
                <button
                  type="button"
                  @click="toggleDropdown"
                  class="w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex justify-between items-center"
                >
                  <span
                    :class="
                      form.bookId
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    "
                  >
                    {{ selectedBookTitle || "Выберите книгу" }}
                  </span>
                  <svg
                    class="w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200"
                    :class="{ 'rotate-180': isDropdownOpen }"
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

                <!-- Выпадающий список -->
                <div
                  v-if="isDropdownOpen"
                  class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  <div
                    v-for="book in unreadBooks"
                    :key="book.id"
                    @click="selectBook(book)"
                    class="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                    :class="{
                      'bg-blue-50 dark:bg-blue-900/20': form.bookId === book.id,
                    }"
                  >
                    <div class="font-medium text-gray-900 dark:text-white">
                      {{ book.title }}
                    </div>
                    <div
                      class="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
                    >
                      {{ book.author || "Автор не указан" }}
                    </div>
                  </div>

                  <div
                    v-if="unreadBooks.length === 0"
                    class="px-3 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    Нет непрочитанных книг
                  </div>
                </div>
              </div>
            </div>

            <!-- Отображение книги при редактировании -->
            <div v-else>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Книга
              </label>
              <div
                class="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                {{ sessionToEdit.bookTitle }}
              </div>
            </div>

            <!-- Цвет сессии -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Цвет сессии
              </label>
              <div class="grid grid-cols-8 gap-2 opacity-60">
                <button
                  v-for="color in colorOptions"
                  :key="color"
                  type="button"
                  class="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                  :class="[
                    form.color === color
                      ? 'border-gray-900 dark:border-white scale-110 shadow-md'
                      : 'border-transparent',
                  ]"
                  :style="{ backgroundColor: color }"
                  @click="form.color = color"
                ></button>
              </div>
            </div>

            <!-- Начало -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 grid-flow-row"
              >
                Начало
              </label>

              <div class="grid grid-cols-12 gap-2">
                <div class="col-span-5">
                  <input
                    type="date"
                    :value="formattedStartDate"
                    @input="updateStartDate($event.target.value)"
                    required
                    class="w-full h-10 px-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div class="col-span-4">
                  <input
                    type="time"
                    :value="formattedStartTime"
                    @input="updateStartTime($event.target.value)"
                    required
                    class="w-full h-10 px-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div class="col-span-3">
                  <input
                    type="number"
                    v-model.number="form.startPage"
                    placeholder="№ стр."
                    min="1"
                    class="w-full h-10 px-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <!-- Конец -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 grid-flow-row"
              >
                Конец
              </label>
              <div class="grid grid-cols-12 gap-2">
                <div class="col-span-5">
                  <input
                    type="date"
                    :value="formattedEndDate"
                    @input="updateEndDate($event.target.value)"
                    required
                    class="w-full h-10 px-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div class="col-span-4">
                  <input
                    type="time"
                    :value="formattedEndTime"
                    @input="updateEndTime($event.target.value)"
                    required
                    class="w-full h-10 px-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div class="col-span-3">
                  <input
                    type="number"
                    v-model.number="form.endPage"
                    placeholder="№ стр."
                    min="1"
                    class="w-full h-10 px-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div
              v-if="
                form.startPage && form.endPage && form.startPage < form.endPage
              "
              class="leading-3 text-xs text-gray-700 dark:text-gray-300"
            >
              Страниц прочитано: {{ pagesRead }}
            </div>
            <div
              v-if="
                form.startPage && form.endPage && form.startPage > form.endPage
              "
              class="text-sm text-red-600 dark:text-red-400"
            >
              Начальная страница не может быть больше конечной
            </div>

            <div
              v-if="form.startDate && form.date && form.startDate < form.date"
              class="leading-3 text-xs text-gray-700 dark:text-gray-300"
            >
              Время сессии: {{ timeRead }}
            </div>
            <div
              v-if="form.startDate && form.date && form.startDate > form.date"
              class="text-sm text-red-600 dark:text-red-400"
            >
              Начальные дата/время не могут быть позже конечных
            </div>

            <!-- Чекбокс "Книга дочитана" -->
            <div
              class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <input
                type="checkbox"
                id="finishedBook"
                v-model="form.finishedBook"
                @change="handleFinishedBookChange"
                class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label
                for="finishedBook"
                class="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Книга дочитана
              </label>
            </div>
          </form>
        </div>

        <ModalActions
          :is-edit="!!sessionToEdit?.id"
          @reset="resetForm"
          @submit="handleSubmit"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from "vue";
import { useSessionStore } from "../../stores/session";
import { useLibraryStore } from "../../stores/library";
import ModalHeader from "../modal/ModalHeader.vue";
import ModalActions from "../modal/ModalActions.vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  initialDate: {
    type: Date,
    default: () => new Date(),
  },
  sessionToEdit: {
    type: Object,
    default: null,
  },
  fromCalendar: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "saved"]);

const sessionStore = useSessionStore();
const libraryStore = useLibraryStore();

const loading = ref(false);
const unreadBooks = ref([]);
const isDropdownOpen = ref(false);
const dropdownContainerRef = ref(null);
const isClosing = ref(false);

const isFromCalendar = computed(
  () => props.fromCalendar && !props.sessionToEdit?.id,
);

const colorOptions = [
  "#FF0000",
  "#FF7700",
  "#FFE500",
  "#15FF00",
  "#00F6FF",
  "#006EFF",
  "#8700FF",
  "#FF00C7",
];

const form = reactive({
  bookId: "",
  color: "#3B82F6",
  startDate: null,
  date: null,
  startPage: null,
  endPage: null,
  finishedBook: false,
  rating: 0,
});

// ========== Вспомогательные функции ==========
const formatDateForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTimeForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const combineDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  return new Date(`${dateStr}T${timeStr}`);
};

const getLastSessionForBook = (bookId) => {
  const allSessions = sessionStore.sessions;
  const bookSessions = allSessions.filter((s) => s.bookId === bookId);
  if (bookSessions.length === 0) return null;

  return bookSessions.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
};

const autoFillStartPage = (bookId) => {
  const lastSession = getLastSessionForBook(bookId);
  if (lastSession && !lastSession.finishedBook) {
    const lastPage = lastSession.endPage || lastSession.pagesRead;
    if (lastPage) {
      form.startPage = lastPage + 1;
    }
  } else if (!lastSession) {
    form.startPage = 1;
  }
};

// ========== Валидация дат ==========
const validateAndFixDates = () => {
  if (!form.startDate || !form.date) return false;

  if (form.date < form.startDate) {
    form.date = new Date(form.startDate);
    return true;
  }
  return false;
};

// ========== Вычисляемые свойства ==========
const selectedBookTitle = computed(() => {
  const book = unreadBooks.value.find((b) => b.id === form.bookId);
  return book ? book.title : "";
});

const formattedStartDate = computed(() => {
  return form.startDate ? formatDateForInput(form.startDate) : "";
});

const formattedStartTime = computed(() => {
  return form.startDate ? formatTimeForInput(form.startDate) : "";
});

const formattedEndDate = computed(() => {
  return form.date ? formatDateForInput(form.date) : "";
});

const formattedEndTime = computed(() => {
  return form.date ? formatTimeForInput(form.date) : "";
});

const pagesRead = computed(() => {
  if (form.startPage && form.endPage && form.startPage <= form.endPage) {
    return form.endPage - form.startPage + 1;
  }
  return 0;
});

const timeRead = computed(() => {
  if (form.startDate && form.date && form.startDate <= form.date) {
    const diffMs = new Date(form.date) - new Date(form.startDate);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }
  return "00:00";
});

// ========== Методы обновления даты и времени ==========
const updateStartDate = (dateStr) => {
  const newDate = combineDateTime(dateStr, formattedStartTime.value);
  if (newDate) {
    form.startDate = newDate;
    validateAndFixDates();
  }
};

const updateStartTime = (timeStr) => {
  const newDate = combineDateTime(formattedStartDate.value, timeStr);
  if (newDate) {
    form.startDate = newDate;
    validateAndFixDates();
  }
};

const updateEndDate = (dateStr) => {
  const newDate = combineDateTime(dateStr, formattedEndTime.value);
  if (newDate) {
    form.date = newDate;
    validateAndFixDates();
  }
};

const updateEndTime = (timeStr) => {
  const newDate = combineDateTime(formattedEndDate.value, timeStr);
  if (newDate) {
    form.date = newDate;
    validateAndFixDates();
  }
};

// ========== Загрузка данных ==========
const loadUnreadBooks = async () => {
  try {
    unreadBooks.value = await libraryStore.getUnreadBooks();
  } catch (error) {
    console.error("Ошибка загрузки книг:", error);
  }
};

const loadLastSession = () => {
  if (props.sessionToEdit?.id) return;

  const lastSession = sessionStore.loadLastSession();
  if (lastSession && lastSession.bookId) {
    form.bookId = lastSession.bookId;
    form.color = lastSession.color || "#3B82F6";
    autoFillStartPage(form.bookId);
  }
};

// ========== Сброс формы ==========
const resetForm = () => {
  if (props.sessionToEdit?.id) {
    console.log("Editing session:", props.sessionToEdit);

    if (props.sessionToEdit) {
      form.bookId = props.sessionToEdit.bookId;
      form.color = props.sessionToEdit.color || "#3B82F6";
      form.startDate = props.sessionToEdit.startDate
        ? new Date(props.sessionToEdit.startDate)
        : new Date(props.sessionToEdit.date);
      form.date = new Date(props.sessionToEdit.date);
      form.startPage = props.sessionToEdit.startPage || null;
      form.endPage = props.sessionToEdit.endPage || null;
      form.finishedBook = props.sessionToEdit.finishedBook || false;
      form.rating = props.sessionToEdit.rating || 0;
    }
  } else {
    form.bookId = "";
    form.color = "#3B82F6";
    form.startPage = null;
    form.endPage = null;
    form.finishedBook = false;
    form.rating = 0;

    const now = new Date();

    if (isFromCalendar.value) {
      const fixedDate = new Date(props.initialDate);
      fixedDate.setHours(now.getHours(), now.getMinutes());
      form.startDate = fixedDate;
      form.date = new Date(fixedDate);
      form.date.setMinutes(form.date.getMinutes() + 30); // По умолчанию +30 минут
    } else {
      form.startDate = new Date();
      form.date = new Date();
      form.date.setMinutes(form.date.getMinutes() + 30);
    }
  }

  validateAndFixDates();
};

// Отправка формы
const handleSubmit = async () => {
  validateAndFixDates();

  console.log(form.bookId);
  if (!form.bookId && !props.sessionToEdit?.id) {
    alert("Выберите книгу");
    return;
  }

  if (!form.date) {
    alert("Выберите конечную дату и время");
    return;
  }

  if (form.startPage && form.endPage && form.startPage > form.endPage) {
    alert("Начальная страница не может быть больше конечной");
    return;
  }

  if (form.startDate && form.date && form.startDate > form.date) {
    alert("Начальные дата/время не могут быть позже конечных");
    return;
  }

  loading.value = true;

  try {
    if (props.sessionToEdit?.id) {
      await sessionStore.updateSession(props.sessionToEdit.id, {
        color: form.color,
        date: form.date,
        startDate: form.startDate,
        startPage: form.startPage,
        endPage: form.endPage,
        pagesRead: pagesRead.value,
        finishedBook: form.finishedBook,
        rating: form.rating,
      });
    } else {
      const selectedBook = unreadBooks.value.find((b) => b.id === form.bookId);
      if (!selectedBook) throw new Error("Книга не найдена");

      await sessionStore.addSession({
        bookId: form.bookId,
        bookTitle: selectedBook.title,
        color: form.color,
        date: form.date,
        startDate: form.startDate,
        startPage: form.startPage,
        endPage: form.endPage,
        pagesRead: pagesRead.value,
        finishedBook: form.finishedBook,
        rating: form.rating,
      });
    }

    emit("saved");
    handleClose();
  } catch (error) {
    console.error("Ошибка сохранения сессии:", error);
    alert("Ошибка при сохранении сессии");
  } finally {
    loading.value = false;
  }
};

// ========== Управление дропдауном ==========
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectBook = (book) => {
  form.bookId = book.id;
  isDropdownOpen.value = false;
  autoFillStartPage(form.bookId);
};

const handleClickOutside = (event) => {
  if (
    dropdownContainerRef.value &&
    !dropdownContainerRef.value.contains(event.target)
  ) {
    isDropdownOpen.value = false;
  }
};

// ========== Управление модалкой ==========
const handleClose = () => {
  if (isClosing.value) return;
  isClosing.value = true;
  isDropdownOpen.value = false;
  resetForm();
  emit("close");
  setTimeout(() => {
    isClosing.value = false;
  }, 300);
};

const handleFinishedBookChange = () => {
  if (form.finishedBook && !form.rating) {
  }
};

// ========== Watchers ==========
watch(
  () => [form.startDate, form.date],
  ([newStartDate, newEndDate]) => {
    if (newStartDate && newEndDate && !loading.value) {
      validateAndFixDates();
    }
  },
  { deep: true },
);

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      document.body.classList.add("modal-open");
      isClosing.value = false;

      if (!props.sessionToEdit?.id) {
        await loadUnreadBooks();
      }

      resetForm();

      if (!props.sessionToEdit?.id && !props.fromCalendar) {
        loadLastSession();
      }

      setTimeout(() => {
        validateAndFixDates();
      }, 0);
    } else {
      document.body.classList.remove("modal-open");
    }
  },
  { immediate: true },
);

// ========== Lifecycle ==========
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.body.classList.remove("modal-open");
});
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

input[type="date"]::-webkit-calendar-picker-indicator,
input[type="time"]::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

input[type="date"],
input[type="time"] {
  position: relative;
}
</style>
