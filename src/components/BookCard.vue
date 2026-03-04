<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
    :class="[isGrid ? 'flex' : '']"
  >
    <!-- Обложка -->
    <div
      class="bg-gray-100 flex-shrink-0"
      :class="isGrid ? 'w-24 h-32' : 'w-full h-48'"
    >
      <div
        class="w-full h-full flex items-center justify-center text-4xl text-gray-400"
      >
        📖
      </div>
    </div>

    <!-- Информация о книге -->
    <div class="p-3 flex-1" :class="isGrid ? '' : 'relative'">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h3 class="font-semibold text-gray-800 line-clamp-2">
            {{ book.title }}
          </h3>
          <p class="text-sm text-gray-500 mt-1">{{ book.author }}</p>

          <!-- Формат и статус -->
          <div class="flex items-center gap-2 mt-2">
            <span class="text-xs px-2 py-1 bg-gray-100 rounded-full">
              {{ book.format }}
            </span>
            <span
              class="text-xs px-2 py-1 rounded-full"
              :class="{
                'bg-green-100 text-green-700': book.status === 'прочитано',
                'bg-yellow-100 text-yellow-700': book.status === 'не прочитано',
                'bg-red-100 text-red-700': book.status === 'брошено',
              }"
            >
              {{ book.status }}
            </span>
          </div>

          <!-- Рейтинг (только для прочитанных) -->
          <div v-if="book.status === 'прочитано'" class="mt-2 text-yellow-400">
            <span v-for="n in 5" :key="n" class="text-lg">
              {{ n <= (book.rating || 0) ? "★" : "☆" }}
            </span>
          </div>
        </div>

        <!-- Кнопки действий -->
        <div class="flex gap-1">
          <IconButton icon="✎" @click="$emit('edit', book)" />
          <IconButton
            icon="♥"
            :class="book.isFavorite ? 'text-red-500' : ''"
            @click="$emit('favorite', book)"
          />
          <IconButton icon="🗑" @click="$emit('delete', book)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import IconButton from "./IconButton.vue";

defineProps({
  book: {
    type: Object,
    required: true,
  },
  isGrid: {
    type: Boolean,
    default: true, // true = карточка (горизонтальная), false = плитка (вертикальная)
  },
});

defineEmits(["edit", "favorite", "delete"]);
</script>
