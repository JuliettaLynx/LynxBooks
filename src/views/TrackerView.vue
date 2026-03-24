<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
  >
    <!-- Шапка -->
    <div
      class="sticky top-0 bg-white dark:bg-gray-800 z-10 border-b dark:border-gray-700 transition-colors duration-200"
    >
      <div class="p-3">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold dark:text-white">Трекер чтения</h1>
          <div class="flex gap-2 items-center">
            <button
              @click="openYearPicker"
              class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {{ currentYear }}
            </button>
            <UserProfile />
          </div>
        </div>
      </div>

      <!-- Месяц с навигацией -->
      <div class="h-4 mb-2 flex items-center justify-between">
        <IconButton
          icon="←"
          variant="default"
          @click="prevMonth"
          class="text-xl"
        />

        <h2 class="text-lg font-semibold dark:text-white capitalize">
          {{ currentMonthName }}
        </h2>

        <IconButton
          icon="→"
          variant="default"
          @click="nextMonth"
          class="text-xl"
        />
      </div>
    </div>

    <!-- Индикатор загрузки или ошибка -->
    <div v-if="sessionStore.loading" class="p-4 text-center">
      <div class="inline-block text-2xl animate-spin">⌛</div>
      <p class="text-gray-500 dark:text-gray-400 mt-2">Загрузка сессий...</p>
    </div>

    <div v-else-if="sessionStore.error" class="p-4 text-center">
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
        @day-click="openDayDetails"
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
    <!--
    <SessionModal
      :is-open="isSessionModalOpen"
      :initial-date="selectedDate"
      @close="closeSessionModal"
      @saved="onSessionSaved"
    />

    <DayDetailsModal
      :is-open="isDayDetailsOpen"
      :date="selectedDate"
      @close="closeDayDetails"
      @session-updated="onSessionUpdated"
    />

    <YearPickerModal
      :is-open="isYearPickerOpen"
      :current-year="currentYear"
      @close="closeYearPicker"
      @select="changeYear"
    />

    <GoalSettingsModal
      :is-open="isGoalSettingsOpen"
      :current-goal="dailyGoal"
      @close="closeGoalSettings"
      @save="updateGoal"
    />
    -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { auth } from "../firebase/config";
import { useSessionStore } from "../stores/session";
import { useUserStore } from "../stores/user";
import IconButton from "../components/IconButton.vue";
import UserProfile from "../components/UserProfile.vue";
import CalendarGrid from "../components/tracker/CalendarGrid.vue";
// import SessionModal from "../components/tracker/SessionModal.vue";
// import DayDetailsModal from "../components/tracker/DayDetailsModal.vue";
// import YearPickerModal from "../components/tracker/YearPickerModal.vue";
// import GoalSettingsModal from "../components/tracker/GoalSettingsModal.vue";

const sessionStore = useSessionStore();
const userStore = useUserStore();

// Состояние
const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth());
const selectedDate = ref(new Date());
const isSessionModalOpen = ref(false);
const isDayDetailsOpen = ref(false);
const isYearPickerOpen = ref(false);
const isGoalSettingsOpen = ref(false);

// Вычисляемые свойства
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

const dailyGoal = computed(() => userStore.dailyGoal || 50);

// Статистика за месяц
const monthlyPagesRead = computed(() => {
  let total = 0;
  for (let day = 1; day <= daysInMonth.value; day++) {
    const date = new Date(currentYear.value, currentMonth.value, day);
    total += sessionStore.getPagesReadByDate(date);
  }
  return total;
});

const monthlyProgressPercent = computed(() => {
  const goal = dailyGoal.value * daysInMonth.value;
  if (goal === 0) return 0;
  return Math.min(Math.round((monthlyPagesRead.value / goal) * 100), 100);
});

// Методы навигации по месяцам
const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
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

const updateGoal = async (goal) => {
  await userStore.setDailyGoal(goal);
  closeGoalSettings();
};

// Обработчики модалок
const openSessionModal = (date = new Date()) => {
  selectedDate.value = date;
  isSessionModalOpen.value = true;
};

const openDayDetails = (date) => {
  selectedDate.value = date;
  isDayDetailsOpen.value = true;
};

const openYearPicker = () => {
  isYearPickerOpen.value = true;
};

const openGoalSettings = () => {
  isGoalSettingsOpen.value = true;
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

const closeGoalSettings = () => {
  isGoalSettingsOpen.value = false;
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

// Инициализация
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
