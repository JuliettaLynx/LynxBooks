<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50"
      @click.self="$emit('close')"
    >
      <div
        class="bg-white w-full rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
      >
        <!-- Заголовок -->
        <div
          class="sticky top-0 bg-white border-b p-4 flex justify-between items-center"
        >
          <h2 class="text-lg font-semibold">Добавить книгу</h2>
          <IconButton icon="✕" @click="$emit('close')" />
        </div>

        <!-- Контент (пока пустой) -->
        <div class="p-4">
          <p class="text-gray-500 text-center py-8">
            Форма добавления книги появится позже
          </p>
        </div>

        <!-- Кнопки -->
        <div class="border-t p-4 flex gap-2">
          <button class="flex-1 py-2 px-4 border rounded-lg hover:bg-gray-50">
            Очистить
          </button>
          <button
            class="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import IconButton from "./IconButton.vue";

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["close"]);
</script>
