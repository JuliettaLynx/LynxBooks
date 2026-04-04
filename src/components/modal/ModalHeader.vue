<template>
  <div
    class="flex-shrink-0 border-b border-border dark:border-border-dark p-4 flex justify-between items-center"
  >
    <h2 class="text-lg font-semibold dark:text-white">{{ title }}</h2>
    <IconButton icon="✕" @click="$emit('close')" class="dark:text-gray-400" />
  </div>
</template>

<script setup>
import IconButton from "../IconButton.vue";

defineProps({
  title: String,
});

defineEmits(["close"]);
</script>
