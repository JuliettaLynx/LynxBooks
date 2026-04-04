<template>
  <nav
    class="fixed bottom-0 left-0 w-full bg-white dark:bg-bg-secondary-dark border-t border-border-light dark:border-border-dark flex justify-around items-center h-14 z-20 transition-colors duration-200 shadow-[0_-6px_16px_6px_rgba(71,0,102,0.1)] dark:shadow-[0_-6px_16px_6px_rgba(0,0,0,0.4)]"
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
