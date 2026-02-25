import { createRouter, createWebHistory } from "vue-router";
import Login from "./pages/Login.vue";
import PaymentForm from "./pages/PaymentForm.vue";
import History from "./pages/History.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },
  { path: "/payment", component: PaymentForm, meta: { requiresAuth: true } },
  { path: "/history", component: History, meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guard для проверки авторизации
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  
  if (to.meta.requiresAuth && !token) {
    next("/login");
  } else if (to.path === "/login" && token) {
    next("/payment");
  } else {
    next();
  }
});

export default router;
