<template>
  <div
    class="min-h-screen bg-white dark:bg-bg-primary-dark transition-colors duration-200"
  >
    <!-- Шапка -->
    <div
      class="sticky top-0 z-20 border-b border-border dark:border-border-dark bg-bg-secondary dark:bg-bg-secondary-dark text-black dark:text-bg-secondary shadow-[0_6px_16px_6px_rgba(71,0,102,0.1)] dark:shadow-[0_6px_16px_6px_rgba(0,0,0,0.4)] transition-colors duration-200"
    >
      <div class="p-3">
        <div class="flex justify-between items-center">
          <h1 class="text-xl tracking-wider font-bold dark:text-white">
            Вишлист
          </h1>
          <!-- Иконка профиля -->
          <UserProfile />
        </div>
      </div>
    </div>

    <!-- Контент -->
    <div class="p-4">
      <p class="text-gray-600 dark:text-gray-400">
        Скоро здесь появится список желаний
      </p>
    </div>
  </div>
</template>

<script setup>
import UserProfile from "../components/UserProfile.vue";
</script>
