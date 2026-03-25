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
        <div
          class="text-sm font-medium dark:text-white text-gray-600 mt-1 ml-6"
        >
          Статистика: {{ totalPages }} / {{ dailyGoal }}
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
                    <template v-if="session.startPage && session.endPage">
                      {{ formatTime(session.startDate) }} →
                      {{ formatTime(session.date) }}
                      <span class="text-gray-400">
                        ({{ getTimeDuration(session.startDate, session.date) }})
                      </span>
                    </template>
                    <template v-else>
                      {{ session.pagesRead || 0 }} стр.
                    </template>
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
                      {{ session.pagesRead || 0 }} стр.
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

        <!-- Кнопка добавления -->
        <ModalActions
          :hide-reset="true"
          submit-label="+ Добавить сессию"
          @submit="addSession"
        />
      </div>
    </div>
  </Teleport>

  <!-- Модалка для добавления/редактирования -->
  <SessionModal
    :is-open="isSessionModalOpen"
    :initial-date="sessionInitialDate"
    :session-to-edit="selectedSession"
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
