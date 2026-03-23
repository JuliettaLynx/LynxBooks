<template>
  <div>
    <label
      class="block text-sm mt-4 font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      Формат книги
    </label>
    <div class="flex gap-3">
      <label class="flex items-center">
        <input
          type="radio"
          :checked="modelValue === 'бумажная'"
          value="бумажная"
          class="mr-2"
          @change="$emit('update:modelValue', 'бумажная')"
        />
        <span class="text-sm dark:text-gray-300">Бумажная</span>
      </label>

      <label class="flex items-center">
        <input
          type="radio"
          :checked="modelValue === 'электронная'"
          value="электронная"
          class="mr-2"
          @change="$emit('update:modelValue', 'электронная')"
        />
        <span class="text-sm dark:text-gray-300">Электронная</span>
      </label>

      <label class="flex items-center">
        <input
          type="radio"
          :checked="modelValue === 'аудио'"
          value="аудио"
          class="mr-2"
          @change="$emit('update:modelValue', 'аудио')"
        />
        <span class="text-sm dark:text-gray-300">Аудио</span>
      </label>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
});

defineEmits(["update:modelValue"]);
</script>

<style scoped>
.text-13 {
  font-size: 0.8rem;
  line-height: 1rem;
}
</style>
