<template>
  <div class="space-y-4">
    <div>
      <input
        :value="title"
        type="text"
        required
        class="w-full px-3 py-2 bg-white dark:bg-border-dark/40 dark:text-white border border-border dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        placeholder="Название"
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
