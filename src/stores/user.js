import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const dailyGoal = ref(parseInt(localStorage.getItem("dailyGoal")) || 50);

  const setDailyGoal = (goal) => {
    dailyGoal.value = goal;
    localStorage.setItem("dailyGoal", goal);
  };

  return {
    dailyGoal,
    setDailyGoal,
  };
});
