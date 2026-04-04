<template>
  <div class="flex-shrink-0 border-t border-border dark:border-border-dark p-4">
    <div class="flex gap-2">
      <button
        type="button"
        @click="$emit('reset')"
        class="flex-1 py-2 px-4 dark:bg-border-dark/40 border border-border dark:border-border-dark rounded-lg hover:bg-purple-700/10 dark:hover:bg-border-dark dark:text-white transition-colors"
      >
        Очистить
      </button>
      <button
        type="button"
        @click="$emit('submit')"
        class="flex-1 py-2 px-4 bg-accent/60 hover:bg-accent/80 text-black/70 dark:text-white rounded-lg transition-colors"
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
