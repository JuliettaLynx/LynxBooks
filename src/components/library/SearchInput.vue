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
      class="w-full pl-10 pr-4 py-2 border border-border dark:border-border-dark bg-bg-secondary dark:bg-bg-secondary-dark font-light text-bg-primary-dark dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200 placeholder:text-bg-primary-dark/40 dark:placeholder:text-white/40"
    />
    <button
      v-if="modelValue"
      @click="$emit('update:modelValue', '')"
      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
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
