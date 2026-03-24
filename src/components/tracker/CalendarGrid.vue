<template>
  <div class="grid grid-cols-7 gap-1">
    <!-- Дни недели -->
    <div
      v-for="day in weekDays"
      :key="day"
      class="text-center text-xs font-medium text-gray-500 dark:text-gray-400"
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
      class="relative aspect-[1/2] bg-gray-100 dark:bg-gray-800 cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      @click="$emit('day-click', new Date(year, month, day))"
    >
      <!-- Цветные секции -->
      <div
        v-if="getProgressSegments(day).length > 0"
        class="absolute inset-0 flex"
      >
        <div
          v-for="(segment, idx) in getProgressSegments(day)"
          :key="idx"
          class="h-full"
          :style="{
            width: `${segment.widthPercent}%`,
            backgroundColor: segment.color,
          }"
          :title="`${segment.bookTitle}: ${segment.pages}`"
        ></div>
      </div>

      <!-- Контент поверх цветных секций -->
      <div class="absolute inset-0 flex flex-col items-center justify-between">
        <!-- Количество страниц - сверху -->
        <div
          class="text-xs font-bold px-1.5 py-0.5 rounded-full"
          :class="getPagesColor(getPagesRead(day))"
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

      <!-- Индикаторы цветов книг (маленькие точки внизу) -->
      <div
        v-if="getUniqueColors(day).length > 0"
        class="absolute bottom-1 left-1 right-1 flex gap-0.5 justify-center"
      >
        <div
          v-for="(color, idx) in getUniqueColors(day).slice(0, 4)"
          :key="idx"
          class="w-1.5 h-1.5 rounded-full"
          :style="{ backgroundColor: color }"
        ></div>
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

  // Сортируем по времени создания
  return [...sessions].sort((a, b) => {
    const timeA = a.createdAt?.getTime?.() || 0;
    const timeB = b.createdAt?.getTime?.() || 0;
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

  if (sessions.length === 0 || totalPages === 0) {
    return [];
  }

  const segments = [];

  for (const session of sessions) {
    const pagesRead = session.pagesRead || 0;
    const percentOfTotal = (pagesRead / totalPages) * 100;

    segments.push({
      color: session.color || "#9CA3AF",
      pages: pagesRead,
      bookTitle: session.bookTitle || "Книга",
      widthPercent: percentOfTotal,
    });
  }

  return segments;
};

const getPagesColor = (pages) => {
  const goal = userStore.dailyGoal || 50;
  if (pages === 0) return "text-gray-500 dark:text-gray-400";
  if (pages >= goal) return "text-green-600 dark:text-green-400";
  if (pages >= goal * 0.75) return "text-emerald-600 dark:text-emerald-400";
  if (pages >= goal * 0.5) return "text-yellow-600 dark:text-yellow-400";
  if (pages >= goal * 0.25) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
};

const getUniqueColors = (day) => {
  const sessions = getSessionsForDay(day);
  const colors = sessions.map((s) => s.color).filter((c) => c);
  return [...new Set(colors)];
};
</script>
