<template>
  <button
    class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none"
    :class="[variant === 'primary' ? 'text-blue-600' : 'text-gray-600']"
    @click="$emit('click')"
  >
    <span class="text-lg" v-if="icon">{{ icon }}</span>
    <span v-if="text" class="ml-1">{{ text }}</span>
  </button>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: "",
  },
  text: {
    type: String,
    default: "",
  },
  variant: {
    type: String,
    default: "default", // 'default', 'primary'
    validator: (value) => ["default", "primary"].includes(value),
  },
});

defineEmits(["click"]);
</script>
