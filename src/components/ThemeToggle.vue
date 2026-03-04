<template>
  <IconButton
    :icon="isDark ? '🌙' : '☀️'"
    variant="primary"
    @click="toggleDark()"
    class="text-xl"
  />
</template>

<script setup>
import { useDark, useToggle } from "@vueuse/core";
import IconButton from "./IconButton.vue";

const isDark = useDark();
const toggleDark = useToggle(isDark);
</script>
