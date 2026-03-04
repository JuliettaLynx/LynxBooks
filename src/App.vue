<template>
  <div class="min-h-screen bg-gray-50 pb-16">
    <router-view />
    <BottomNav />
  </div>
</template>

<script setup>
import BottomNav from "./components/BottomNav.vue";
</script>
