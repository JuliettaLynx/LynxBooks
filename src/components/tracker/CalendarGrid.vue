<template>
  <div class="grid grid-cols-7 gap-1">
    <!-- Дни недели -->
    <div
      v-for="day in weekDays"
      :key="day"
      class="text-center text-xs font-medium text-black dark:text-white"
    >
      {{ day }}
    </div>

    <!-- Пустые ячейки для начала месяца -->
    <div
      v-for="n in startOffset"
      :key="`empty-${n}`"
      class="aspect-[1/2]"
    ></div>

    <!-- Дни месяца -->
    <div
      v-for="day in daysInMonth"
      :key="day"
      class="relative aspect-[1/2] border border-border dark:border-border-dark bg-white dark:bg-bg-secondary-dark cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      @click="$emit('day-click', new Date(year, month, day))"
    >
      <!-- Цветные секции -->
      <div
        v-if="getProgressSegments(day).length > 0"
        class="absolute inset-0 flex flex-col-reverse"
      >
        <div
          v-for="(segment, idx) in getProgressSegments(day)"
          :key="idx"
          class="w-full transition-all duration-200 opacity-60"
          :style="{
            height: `${segment.heightPercent}%`,
            backgroundColor: segment.color,
          }"
        ></div>
      </div>

      <!-- Контент поверх цветных секций -->
      <div class="absolute inset-0 flex flex-col items-center justify-between">
        <!-- Количество страниц - сверху -->
        <div
          class="text-xs font-bold px-1.5 py-0.5 rounded-full text-gray-700 dark:text-gray-300"
        >
          {{ getPagesRead(day) }}
        </div>

        <!-- Число дня - снизу -->
        <div
          class="text-sm font-semibold text-gray-900 dark:text-gray-200 px-1.5 py-0.5 rounded-full"
        >
          {{ day }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useSessionStore } from "../../stores/session";
import { useUserStore } from "../../stores/user";

const props = defineProps({
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["day-click"]);

const sessionStore = useSessionStore();
const userStore = useUserStore();

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const daysInMonth = computed(() => {
  return new Date(props.year, props.month + 1, 0).getDate();
});

const startOffset = computed(() => {
  const firstDay = new Date(props.year, props.month, 1).getDay();
  return firstDay === 0 ? 6 : firstDay - 1;
});

const getSessionsForDay = (day) => {
  const date = new Date(props.year, props.month, day);
  const sessions = sessionStore.getSessionsByDate(date);

  // Сортируем по времени
  return [...sessions].sort((a, b) => {
    const timeA = a.date?.getTime?.() || 0;
    const timeB = b.date?.getTime?.() || 0;
    return timeA - timeB;
  });
};

const getPagesRead = (day) => {
  const date = new Date(props.year, props.month, day);
  return sessionStore.getPagesReadByDate(date);
};

const getProgressSegments = (day) => {
  const sessions = getSessionsForDay(day);
  const totalPages = getPagesRead(day);
  const dailyGoal = userStore.dailyGoal || 50;

  if (sessions.length === 0 || totalPages === 0) {
    return [];
  }

  const segments = [];

  // Если общее количество страниц меньше или равно дневной цели
  if (totalPages <= dailyGoal) {
    for (const session of sessions) {
      const pagesRead = session.pagesRead || 0;
      const heightPercent = (pagesRead / dailyGoal) * 100;

      segments.push({
        color: session.color || "#9CA3AF",
        pages: pagesRead,
        bookTitle: session.bookTitle || "Книга",
        heightPercent: heightPercent,
      });
    }
  } else {
    // Если страниц больше цели, считаем пропорции относительно общей суммы
    for (const session of sessions) {
      const pagesRead = session.pagesRead || 0;
      const heightPercent = (pagesRead / totalPages) * 100;

      segments.push({
        color: session.color || "#9CA3AF",
        pages: pagesRead,
        bookTitle: session.bookTitle || "Книга",
        heightPercent: heightPercent,
      });
    }
  }

  return segments;
};
</script>
