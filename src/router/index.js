import { createRouter, createWebHistory } from "vue-router";
import LibraryView from "../views/LibraryView.vue";
import TrackerView from "../views/TrackerView.vue";
import WishlistView from "../views/WishlistView.vue";

const routes = [
  { path: "/library", component: LibraryView },
  { path: "/tracker", component: TrackerView },
  { path: "/wishlist", component: WishlistView },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
