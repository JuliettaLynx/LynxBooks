<template>
  <div
    class="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden dark:text-gray-200 relative"
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
      class="bg-gray-100 dark:bg-gray-700 flex-shrink-0"
      :class="isGrid ? 'w-24' : 'h-48'"
    >
      <div
        class="w-full h-full flex items-center justify-center text-4xl text-gray-400 dark:text-gray-500"
      >
        <img
          v-if="book.cover"
          :src="book.cover"
          class="w-full h-full object-cover"
          alt="Обложка"
        />
        <span v-else>📷</span>
      </div>
    </div>

    <!-- Информация о книге -->
    <div class="p-3 flex-1 relative">
      <div class="flex justify-between">
        <div class="flex-1 pr-2">
          <p class="text-sm leading-4 text-gray-500 dark:text-gray-400">
            {{ book.author }}
          </p>
          <p
            class="text-base leading-6 font-medium text-gray-800 dark:text-gray-200 line-clamp-2"
          >
            {{ book.title }}
          </p>
          <!-- Издательство (всегда строка) -->
          <p
            v-if="book.publisher"
            class="text-sm text-gray-500 dark:text-gray-400 mt-3"
          >
            {{ book.publisher }}
          </p>

          <!-- Формат и статус -->
          <div class="flex items-center gap-2 mt-2 flex-wrap">
            <span
              class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full dark:text-gray-300"
            >
              {{ book.format }}
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
            v-if="book.status === 'прочитано'"
            class="mt-2 text-yellow-400 dark:text-yellow-500"
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
</script>
