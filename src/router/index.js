import { createRouter, createWebHistory } from "vue-router";
import LibraryView from "../views/LibraryView.vue";
import TrackerView from "../views/TrackerView.vue";
import WishlistView from "../views/WishlistView.vue";
import NotFoundView from "../views/404.vue";

const routes = [
  {
    path: "/",
    redirect: "/library",
    component: LibraryView,
    meta: { showBottomNav: true }, // показывать навигацию
  },
  {
    path: "/library",
    name: "library",
    component: LibraryView,
    meta: { showBottomNav: true },
  },
  {
    path: "/tracker",
    name: "tracker",
    component: TrackerView,
    meta: { showBottomNav: true },
  },
  {
    path: "/wishlist",
    name: "wishlist",
    component: WishlistView,
    meta: { showBottomNav: true },
  },
  {
    path: "/404",
    name: "404",
    component: NotFoundView,
    meta: { showBottomNav: false }, // не показывать навигацию
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
