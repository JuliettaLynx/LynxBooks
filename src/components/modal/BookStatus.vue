<template>
  <div class="mt-4">
    <label
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      Статус чтения
    </label>
    <div class="flex gap-2 flex-wrap">
      <label
        v-for="status in statuses"
        :key="status.value"
        class="flex-1 px-1.5 py-2 rounded-lg border cursor-pointer transition-colors"
        :class="getStatusClass(status.value)"
      >
        <input
          type="radio"
          :value="status.value"
          :checked="modelValue === status.value"
          class="hidden"
          @change="$emit('update:modelValue', status.value)"
        />
        <div class="text-center">
          <span class="text-xs dark:text-gray-300">{{ status.label }}</span>
        </div>
      </label>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: String,
});

defineEmits(["update:modelValue"]);

const statuses = [
  { value: "не прочитано", label: "Не прочитано" },
  { value: "прочитано", label: "Прочитано" },
  { value: "брошено", label: "Брошено" },
];

const getStatusClass = (status) => {
  const baseClass =
    "dark:bg-border-dark/40 border-border dark:border-border-dark hover:bg-purple-700/10 dark:hover:bg-border-dark";
  const activeClasses = {
    "не прочитано":
      "bg-yellow-100 border-yellow-300 dark:bg-yellow-900 dark:border-yellow-700",
    прочитано:
      "bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700",
    брошено: "bg-red-100 border-red-300 dark:bg-red-900 dark:border-red-700",
  };

  return props.modelValue === status ? activeClasses[status] : baseClass;
};
</script>
