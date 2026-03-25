<template>
  <div
    class="border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow dark:text-gray-200 relative"
    :class="[isGrid ? 'flex' : '']"
  >
    <!-- Три точки (только для плитки) - поверх обложки  -->
    <div v-if="!isGrid" class="absolute top-2 right-2 z-10">
      <BookActions
        :book="book"
        :is-grid="isGrid"
        @favorite="$emit('favorite', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>

    <!-- Обложка -->
    <div
      class="bg-gray-100 dark:bg-gray-700 flex-shrink-0 relative"
      :class="isGrid ? 'w-24' : 'h-60'"
    >
      <!-- Размытый фон (только если есть обложка) -->
      <div
        v-if="book.cover"
        class="absolute z-0 inset-0 bg-cover bg-center"
        :style="{ backgroundImage: `url(${book.cover})` }"
      >
        <div class="absolute inset-0 backdrop-blur-md"></div>
      </div>

      <!-- Формат и статус (только для плиточного расположения, поверх обложки, слева снизу) -->
      <div
        v-if="!isGrid"
        class="absolute z-20 bottom-2 left-2 flex gap-2 flex-col"
      >
        <span
          class="text-xs px-2 py-1 w-8 bg-gray-100 dark:bg-gray-800 rounded-full dark:text-gray-300 shadow-sm"
        >
          <span>{{ getFormatEmoji(book.format) }}</span>
        </span>
        <span
          class="text-xs px-2 py-1 rounded-full shadow-sm"
          :class="{
            'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300':
              book.status === 'прочитано',
            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300':
              book.status === 'не прочитано',
            'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300':
              book.status === 'брошено',
          }"
        >
          {{ book.status }}
        </span>
      </div>

      <div
        class="h-full relative z-10 flex items-center justify-center text-4xl text-gray-400 dark:text-gray-500"
      >
        <img v-if="book.cover" :src="book.cover" class="h-full" alt="Обложка" />
        <span v-else>📷</span>
      </div>
    </div>

    <!-- Информация о книге -->
    <div class="p-3 flex-1 relative">
      <div class="flex justify-between">
        <div class="flex-1 pr-2 inline-block">
          <p class="text-xs leading-3 text-gray-500 dark:text-gray-400">
            {{ book.author }}
          </p>
          <p
            class="text-sm leading-5 font-medium text-gray-800 dark:text-gray-200 line-clamp-2"
          >
            {{ book.title }}
          </p>
          <!-- Издательство (всегда строка) -->
          <p
            v-if="book.publisher"
            class="text-xs text-gray-500 dark:text-gray-400"
          >
            {{ book.publisher }}
          </p>

          <!-- Формат и статус (только для списка) -->
          <div v-if="isGrid" class="flex items-center gap-2 flex-wrap">
            <span class="text-sm">
              <span>{{ getFormatEmoji(book.format) }}</span>
            </span>
            <span
              class="text-xs px-2 py-1 rounded-full"
              :class="{
                'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300':
                  book.status === 'прочитано',
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300':
                  book.status === 'не прочитано',
                'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300':
                  book.status === 'брошено',
              }"
            >
              {{ book.status }}
            </span>
          </div>

          <!-- Рейтинг (только для прочитанных) -->
          <div
            v-if="book.status === 'прочитано' && book.rating !== 0"
            class="text-yellow-400 dark:text-yellow-500"
          >
            <span v-for="n in 5" :key="n" class="text-lg">
              {{ n <= (book.rating || 0) ? "★" : "☆" }}
            </span>
          </div>
        </div>

        <!-- Действия с книгой (для карточек) -->
        <div v-if="isGrid">
          <BookActions
            :book="book"
            :is-grid="isGrid"
            @favorite="$emit('favorite', $event)"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BookActions from "./BookActions.vue";

const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
  isGrid: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["edit", "favorite", "delete"]);

// Функция для получения эмодзи в зависимости от формата
const getFormatEmoji = (format) => {
  const formatMap = {
    бумажная: "📖",
    электронная: "📱",
    аудио: "🎧",
  };

  return formatMap[format] || "📚";
};
</script>
