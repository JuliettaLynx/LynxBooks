<template>
  <nav
    class="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-16 z-20 transition-colors duration-200"
  >
    <router-link
      to="/library"
      class="flex flex-col items-center text-xs text-gray-600 dark:text-gray-400"
      active-class="text-blue-600 dark:text-blue-400"
      exact-active-class="text-blue-600 dark:text-blue-400"
    >
      <span class="text-2xl">📚</span>
    </router-link>
    <router-link
      to="/tracker"
      class="flex flex-col items-center text-xs text-gray-600 dark:text-gray-400"
      active-class="text-blue-600 dark:text-blue-400"
      exact-active-class="text-blue-600 dark:text-blue-400"
    >
      <span class="text-2xl">📊</span>
    </router-link>
    <router-link
      to="/wishlist"
      class="flex flex-col items-center text-xs text-gray-600 dark:text-gray-400"
      active-class="text-blue-600 dark:text-blue-400"
      exact-active-class="text-blue-600 dark:text-blue-400"
    >
      <span class="text-2xl">🎁</span>
    </router-link>
  </nav>
</template>
