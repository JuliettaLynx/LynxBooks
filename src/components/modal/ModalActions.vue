<template>
  <div class="flex-shrink-0 border-t dark:border-gray-700 p-4">
    <div class="flex gap-2">
      <button
        type="button"
        @click="$emit('reset')"
        class="flex-1 py-2 px-4 border-2 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
      >
        Очистить
      </button>
      <button
        type="button"
        @click="$emit('submit')"
        class="flex-1 py-2 px-4 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
      >
        {{ isEdit ? "Сохранить" : "Добавить" }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isEdit: Boolean,
});

defineEmits(["reset", "submit"]);
</script>
