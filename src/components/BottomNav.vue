<template>
  <nav
    class="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16"
  >
    <router-link
      to="/library"
      class="flex flex-col items-center text-xs"
      active-class="text-blue-600"
      exact-active-class="text-blue-600"
    >
      <span class="text-2xl">📚</span>
    </router-link>
    <router-link
      to="/tracker"
      class="flex flex-col items-center text-xs"
      active-class="text-blue-600"
      exact-active-class="text-blue-600"
    >
      <span class="text-2xl">📊</span>
    </router-link>
    <router-link
      to="/wishlist"
      class="flex flex-col items-center text-xs"
      active-class="text-blue-600"
      exact-active-class="text-blue-600"
    >
      <span class="text-2xl">🎁</span>
    </router-link>
  </nav>
</template>
