<template>
  <nav
    class="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-14 z-20 transition-colors duration-200 shadow-[0_-6px_16px_4px_rgba(100,100,100,0.15)] dark:shadow-[0_-6px_16px_4px_rgba(0,0,0,0.6)]"
  >
    <router-link to="/library">
      <span class="text-xl">📚</span>
    </router-link>
    <router-link to="/tracker">
      <span class="text-xl">📊</span>
    </router-link>
    <router-link to="/wishlist">
      <span class="text-xl">🎁</span>
    </router-link>
  </nav>
</template>
