<template>
  <div class="relative w-full">
    <span
      class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"
    >
      🔍
    </span>
    <input
      type="text"
      :value="modelValue"
      autocomplete="off"
      readonly
      onfocus="this.removeAttribute('readonly')"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      class="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 focus:border-transparent transition-colors duration-200"
    />
    <button
      v-if="modelValue"
      @click="$emit('update:modelValue', '')"
      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
    >
      ✕
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Поиск...",
  },
});

defineEmits(["update:modelValue"]);
</script>
