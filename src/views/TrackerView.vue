<template>
  <div
    ref="trackerContainer"
    class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 touch-pan-y"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <!-- Шапка -->
    <div
      class="sticky top-0 bg-white dark:bg-gray-800 z-10 border-b dark:border-gray-700 transition-colors duration-200 shadow-[0_6px_16px_4px_rgba(0,0,0,0.15)] dark:shadow-[0_6px_16px_4px_rgba(0,0,0,0.2)]"
    >
      <div class="p-3">
        <div class="flex justify-between items-center">
          <h1 class="text-xl font-bold dark:text-white">Трекер чтения</h1>
          <div class="flex gap-2 items-center">
            <button
              @click="openYearPicker"
              class="px-3 py-1 relative right-4 text-sm font-bold bg-gray-100 dark:bg-gray-400 rounded-lg transition-colors"
            >
              {{ currentYear }}
            </button>
            <UserProfile />
          </div>
        </div>
      </div>

      <!-- Месяц с навигацией -->
      <div class="h-4 mb-2 flex items-center justify-between px-3">
        <IconButton
          icon="←"
          variant="default"
          @click="prevMonth"
          class="text-xl dark:text-white"
        />

        <h2 class="text-lg font-semibold dark:text-white capitalize">
          {{ currentMonthName }}
        </h2>

        <IconButton
          icon="→"
          variant="default"
          @click="nextMonth"
          class="text-xl dark:text-white"
        />
      </div>
    </div>

    <!-- Индикатор загрузки или ошибка -->
    <!-- 
    <div v-if="sessionStore.loading" class="p-4 text-center">
      <div class="inline-block text-2xl animate-spin">⌛</div>
      <p class="text-gray-500 dark:text-gray-400 mt-2">Загрузка сессий...</p>
    </div>
    -->

    <div v-if="sessionStore.error" class="p-4 text-center">
      <p class="text-red-500 dark:text-red-400">
        Ошибка: {{ sessionStore.error }}
      </p>
      <button
        @click="retrySync"
        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Повторить
      </button>
    </div>

    <!-- Календарь -->
    <div v-else class="p-4">
      <CalendarGrid
        :year="currentYear"
        :month="currentMonth"
        @day-click="handleCalendarClick"
      />
    </div>

    <!-- Кнопка добавления сессии -->
    <IconButton
      icon="+"
      variant="primary"
      class="fixed z-20 right-4 bottom-20 w-14 h-14 bg-blue-600 dark:bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-2xl flex items-center justify-center transition-colors duration-200"
      @click="openSessionModal"
    />

    <!-- Модальные окна -->
    <SessionModal
      :is-open="isSessionModalOpen"
      :initial-date="selectedDate"
      :session-to-edit="sessionToEdit"
      @close="closeSessionModal"
      @saved="onSessionSaved"
    />

    <YearPickerModal
      :is-open="isYearPickerOpen"
      :current-year="currentYear"
      @close="closeYearPicker"
      @select="changeYear"
    />

    <DayDetailsModal
      :is-open="isDayDetailsOpen"
      :date="selectedDate"
      @close="closeDayDetails"
      @session-updated="onSessionUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { auth } from "../firebase/config";
import { useSessionStore } from "../stores/session";
import IconButton from "../components/IconButton.vue";
import UserProfile from "../components/UserProfile.vue";
import CalendarGrid from "../components/tracker/CalendarGrid.vue";
import SessionModal from "../components/tracker/SessionModal.vue";
import DayDetailsModal from "../components/tracker/DayDetailsModal.vue";
import YearPickerModal from "../components/tracker/YearPickerModal.vue";

const SWIPE_THRESHOLD = 50;
const MOVE_THRESHOLD = 10;

const sessionStore = useSessionStore();

// Состояние
const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth());
const selectedDate = ref(new Date());
const isSessionModalOpen = ref(false);
const isDayDetailsOpen = ref(false);
const isYearPickerOpen = ref(false);
const sessionToEdit = ref(null);

const touchState = ref({
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  hasMoved: false,
  isHorizontalSwipe: false,
});

// ========== Вычисляемые свойства ==========
const currentMonthName = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).toLocaleString(
    "ru",
    {
      month: "long",
    },
  );
});

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
});

const monthlyPagesRead = computed(() => {
  let total = 0;
  for (let day = 1; day <= daysInMonth.value; day++) {
    const date = new Date(currentYear.value, currentMonth.value, day);
    total += sessionStore.getPagesReadByDate(date);
  }
  return total;
});

// ========== Навигация по месяцам ==========
const prevMonth = () => {
  console.log("prevMonth");
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  console.log("nextMonth");
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const changeYear = (year) => {
  currentYear.value = year;
  closeYearPicker();
};

// ========== Обработчики свайпа ==========
const onTouchStart = (event) => {
  if (isSessionModalOpen.value) return;

  const touch = event.touches[0];
  if (!touch) return;

  touchState.value = {
    startX: touch.clientX,
    startY: touch.clientY,
    currentX: touch.clientX,
    currentY: touch.clientY,
    hasMoved: false,
    isHorizontalSwipe: false,
  };

  console.log("Touch start:", touchState.value.startX, touchState.value.startY);
};

const onTouchMove = (event) => {
  if (isSessionModalOpen.value) return;
  console.log("onTouchMove");

  const touch = event.touches[0];
  if (!touch) return;

  const deltaX = Math.abs(touch.clientX - touchState.value.startX);
  const deltaY = Math.abs(touch.clientY - touchState.value.startY);

  if (
    !touchState.value.hasMoved &&
    (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD)
  ) {
    touchState.value.hasMoved = true;
    console.log("Movement detected");
  }

  if (touchState.value.hasMoved && deltaX > deltaY && deltaX > MOVE_THRESHOLD) {
    touchState.value.isHorizontalSwipe = true;
    event.preventDefault();
  }

  touchState.value.currentX = touch.clientX;
  touchState.value.currentY = touch.clientY;
};

const onTouchEnd = () => {
  if (isSessionModalOpen.value) return;

  if (!touchState.value.hasMoved) {
    console.log("No movement, exiting");
    resetTouchState();
    return;
  }

  if (touchState.value.isHorizontalSwipe) {
    const deltaX = touchState.value.currentX - touchState.value.startX;
    console.log("Horizontal swipe detected, deltaX:", deltaX);

    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX > 0) {
        console.log("Swipe right - previous month");
        prevMonth();
      } else {
        console.log("Swipe left - next month");
        nextMonth();
      }
    }
  }
  resetTouchState();
};

const resetTouchState = () => {
  touchState.value = {
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    hasMoved: false,
    isHorizontalSwipe: false,
  };
};

// ========== Управление модалками ==========
const openSessionModal = (date = new Date(), session = null) => {
  selectedDate.value = date;
  sessionToEdit.value = session;
  isSessionModalOpen.value = true;
};

const openDayDetails = (date) => {
  selectedDate.value = date;
  isDayDetailsOpen.value = true;
};

const openYearPicker = () => {
  isYearPickerOpen.value = true;
};

const closeSessionModal = () => {
  isSessionModalOpen.value = false;
};

const closeDayDetails = () => {
  isDayDetailsOpen.value = false;
};

const closeYearPicker = () => {
  isYearPickerOpen.value = false;
};

const handleCalendarClick = (event) => {
  if (touchState.value.hasMoved) {
    console.log("Ignoring click after swipe");
    return;
  }
  openDayDetails(event);
};

const onSessionSaved = () => {
  console.log("Session saved");
};

const onSessionUpdated = () => {
  console.log("Session updated");
};

const retrySync = () => {
  if (auth.currentUser) {
    sessionStore.initSync(auth.currentUser.uid);
  }
};

// ========== Lifecycle ==========
onMounted(() => {
  console.log("TrackerView mounted");
  if (auth.currentUser) {
    console.log("Initializing session sync for user:", auth.currentUser.uid);
    sessionStore.initSync(auth.currentUser.uid);
  } else {
    console.log("No user logged in");
  }
});

onUnmounted(() => {
  sessionStore.cleanup();
});
</script>
