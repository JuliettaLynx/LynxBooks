<template>
  <div class="mt-4">
    <label
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      Аннотация/Отзыв
    </label>
    <textarea
      :value="modelValue"
      rows="3"
      class="w-full px-3 py-2 bg-white dark:bg-border-dark/40 dark:text-white border border-border dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
      placeholder="Краткое описание"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
});

defineEmits(["update:modelValue"]);
</script>
