<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
  >
    <!-- Шапка -->
    <div
      class="sticky top-0 bg-white dark:bg-gray-800 z-10 border-b dark:border-gray-700 transition-colors duration-200 shadow-[0_6px_16px_4px_rgba(100,100,100,0.15)] dark:shadow-[0_6px_16px_4px_rgba(0,0,0,0.6)]"
    >
      <div class="p-3">
        <div class="flex justify-between items-center">
          <h1 class="text-xl font-bold dark:text-white">Wishlist</h1>

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
