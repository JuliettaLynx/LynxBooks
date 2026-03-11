<template>
  <div class="space-y-4">
    <div>
      <input
        :value="title"
        type="text"
        required
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 dark:text-white"
        placeholder="Введите название"
        @input="$emit('update:title', $event.target.value)"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  author: String,
});

defineEmits(["update:title", "update:author"]);
</script>
