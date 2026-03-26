<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4"
      @click.self="close"
    >
      <div
        class="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl max-h-[90vh] flex flex-col"
      >
        <!-- Заголовок -->
        <ModalHeader :title="formattedDate" @close="close" />
        <div class="text-sm dark:text-white text-gray-600 mt-1 ml-6">
          Статистика: {{ totalPages }} страниц за
          {{ formatTotalTime(calculateTotalTime(daySessions)) }}
        </div>

        <!-- Список сессий -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div
            v-for="session in daySessions"
            :key="session.id"
            class="shadow-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-3"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <div
                    class="w-3 h-3 rounded-full"
                    :style="{ backgroundColor: session.color }"
                  ></div>
                  <h4 class="font-medium dark:text-white">
                    {{ session.bookTitle }}
                  </h4>
                </div>

                <div class="text-sm mt-1 text-gray-600 dark:text-gray-300">
                  Время:
                  <span class="font-bold">
                    {{ formatTime(session.startDate) }} →
                    {{ formatTime(session.date) }}
                    <span class="text-gray-400">
                      ({{ getTimeDuration(session.startDate, session.date) }})
                    </span>
                  </span>
                </div>

                <div class="text-sm mt-1 text-gray-600 dark:text-gray-300">
                  Страницы:
                  <span class="font-bold">
                    <template v-if="session.startPage && session.endPage">
                      {{ session.startPage }} → {{ session.endPage }}
                      <span class="text-gray-400">
                        ({{ session.endPage - session.startPage + 1 }})
                      </span>
                    </template>
                    <template v-else>
                      {{ session.startPage ? session.startPage : "NA" }}
                      →
                      {{ session.endPage ? session.endPage : `NA` }}
                    </template>
                  </span>
                </div>

                <!-- Дочитана -->
                <div
                  v-if="session.finishedBook"
                  class="text-sm text-green-600 dark:text-green-400 mt-1"
                >
                  ✓ Книга дочитана
                  <span v-if="session.rating">
                    (оценка: {{ "★".repeat(session.rating) }})
                  </span>
                </div>
              </div>

              <div class="flex gap-1">
                <button
                  @click="editSession(session)"
                  class="p-1 text-gray-400 hover:text-blue-700 dark:text-gray-300"
                  title="Редактировать"
                >
                  ✎
                </button>
                <button
                  @click="deleteSession(session)"
                  class="p-1 text-red-600 hover:text-red-700 dark:text-red-400"
                  title="Удалить"
                >
                  🗑
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="daySessions.length === 0"
            class="text-center py-8 text-gray-500 dark:text-gray-400"
          >
            Нет сессий за этот день
          </div>
        </div>

        <ModalActions
          :hide-reset="true"
          submit-label="+ Добавить сессию"
          @submit="addSession"
          @reset="clearAllSessions"
        />
      </div>
    </div>
  </Teleport>

  <!-- Модалка для добавления/редактирования -->
  <SessionModal
    :is-open="isSessionModalOpen"
    :initial-date="sessionInitialDate"
    :session-to-edit="selectedSession"
    :from-calendar="true"
    @close="closeSessionModal"
    @saved="onSessionSaved"
  />
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useSessionStore } from "../../stores/session";
import { useUserStore } from "../../stores/user";
import ModalHeader from "../modal/ModalHeader.vue";
import ModalActions from "../modal/ModalActions.vue";
import SessionModal from "./SessionModal.vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    required: true,
  },
});

const emit = defineEmits(["close", "session-updated"]);

const sessionStore = useSessionStore();
const userStore = useUserStore();

const isSessionModalOpen = ref(false);
const selectedSession = ref(null);

// ========== Вычисляемые свойства ==========
const formattedDate = computed(() => {
  if (!props.date) return "";
  return props.date.toLocaleDateString("ru", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

const dailyGoal = computed(() => userStore.dailyGoal || 50);

const daySessions = computed(() => {
  if (!props.date) return [];
  return sessionStore.getSessionsByDate(props.date);
});

const totalPages = computed(() => {
  return daySessions.value.reduce((sum, s) => sum + (s.pagesRead || 0), 0);
});

const sessionInitialDate = computed(() => {
  if (!props.date) return new Date();

  const now = new Date();
  const selectedDate = new Date(props.date);
  selectedDate.setHours(now.getHours(), now.getMinutes());

  return selectedDate;
});

// ========== Вспомогательные функции ==========
const getTimeDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return "00:00";
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "00:00";
  const diffMs = end - start;
  if (diffMs <= 0) return "00:00";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

const calculateTotalTime = (sessions) => {
  return sessions.reduce((total, session) => {
    if (!session.startDate || !session.date) return total;

    try {
      const start =
        session.startDate instanceof Date
          ? session.startDate
          : new Date(session.startDate);
      const end =
        session.date instanceof Date ? session.date : new Date(session.date);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return total;

      const diffMs = end - start;
      if (diffMs > 0) {
        return total + diffMs / 1000;
      }
    } catch (err) {
      console.error("Error calculating time:", err);
    }
    return total;
  }, 0);
};

const formatTotalTime = (totalSeconds) => {
  if (!totalSeconds || totalSeconds <= 0) return "0 минут";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const declension = (number, forms) => {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
  };

  const hourForms = ["час", "часа", "часов"];
  const minuteForms = ["минута", "минуты", "минут"];

  const hourText = hours > 0 ? `${hours} ${declension(hours, hourForms)}` : "";
  const minuteText =
    minutes > 0 ? `${minutes} ${declension(minutes, minuteForms)}` : "";

  // Если есть и часы, и минуты
  if (hours > 0 && minutes > 0) {
    return `${hourText} ${minuteText}`;
  }
  // Если только часы
  if (hours > 0) {
    return hourText;
  }
  // Если только минуты
  return minuteText;
};

const formatTime = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
};

// ========== Управление сессиями ==========
const editSession = (session) => {
  selectedSession.value = session;
  isSessionModalOpen.value = true;
};

const deleteSession = async (session) => {
  if (confirm(`Удалить сессию для книги "${session.bookTitle}"?`)) {
    try {
      await sessionStore.deleteSession(session.id);
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Ошибка при удалении сессии");
    }
  }
};

const clearAllSessions = async () => {
  if (daySessions.value.length === 0) return;

  if (
    confirm(
      `Удалить все ${daySessions.value.length} сессий за ${formattedDate.value}?`,
    )
  ) {
    try {
      const deletePromises = daySessions.value.map((session) =>
        sessionStore.deleteSession(session.id),
      );
      await Promise.all(deletePromises);
      emit("session-updated");
    } catch (error) {
      console.error("Ошибка очистки сессий:", error);
      alert("Ошибка при удалении сессий");
    }
  }
};

const addSession = () => {
  selectedSession.value = null;
  const now = new Date();
  const selectedDate = new Date(props.date);
  selectedDate.setHours(now.getHours(), now.getMinutes());
  isSessionModalOpen.value = true;
};

const closeSessionModal = () => {
  isSessionModalOpen.value = false;
  selectedSession.value = null;
};

const onSessionSaved = () => {
  closeSessionModal();
  emit("session-updated");
};

const close = () => {
  emit("close");
};

// ========== Watchers ==========
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
</script>
