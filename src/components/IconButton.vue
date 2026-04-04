<template>
  <button
    class="p-1 rounded-lg transition-colors duration-200 focus:outline-none"
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
