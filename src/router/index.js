import { createRouter, createWebHistory } from "vue-router";
import { auth } from "../firebase/config";
import AuthPage from "../views/Auth.vue";
import LibraryView from "../views/LibraryView.vue";
import TrackerView from "../views/TrackerView.vue";
import WishlistView from "../views/WishlistView.vue";
import NotFoundView from "../views/404.vue";

const routes = [
  {
    path: "/",
    redirect: "/library",
  },
  {
    path: "/library",
    name: "library",
    component: LibraryView,
    meta: { showBottomNav: true, requiresAuth: true },
  },
  {
    path: "/tracker",
    name: "tracker",
    component: TrackerView,
    meta: { showBottomNav: true, requiresAuth: true },
  },
  {
    path: "/wishlist",
    name: "wishlist",
    component: WishlistView,
    meta: { showBottomNav: true, requiresAuth: true },
  },
  {
    path: "/auth",
    name: "auth",
    component: AuthPage,
    meta: { showBottomNav: false, requiresAuth: false },
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
  history: createWebHistory(),
  routes,
});

let isAuthReady = false;

router.beforeEach(async (to, from, next) => {
  // Ждём, пока Firebase инициализируется
  if (!isAuthReady) {
    await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        isAuthReady = true;
        resolve(user);
      });
    });
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest);
  const user = auth.currentUser;

  console.log("Navigation guard:", {
    path: to.path,
    requiresAuth,
    requiresGuest,
    user: user?.email,
  });

  if (requiresAuth && !user) {
    next("/auth");
  } else if (requiresGuest && user) {
    next("/library");
  } else {
    next();
  }
});

export default router;
