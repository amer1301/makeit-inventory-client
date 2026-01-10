import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import LoginView from "../views/LoginView.vue";
import ProductsView from "../views/ProductsView.vue";
import ProductNewView from "../views/ProductNewView.vue";
import ProductEditView from "../views/ProductEditView.vue";

const routes = [
  { path: "/", redirect: "/products" },
  { path: "/login", name: "login", component: LoginView },

  {
    path: "/products",
    name: "products",
    component: ProductsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/products/new",
    name: "product-new",
    component: ProductNewView,
    meta: { requiresAuth: true, roles: ["ADMIN"] },
  },
  {
    path: "/products/:id/edit",
    name: "product-edit",
    component: ProductEditView,
    meta: { requiresAuth: true, roles: ["ADMIN"] },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  // Skyddar routes som kräver autentisering
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: "login" };
  }

  // Förhindrar att inloggade användare navigerar tillbaka till inloggningssidan
  if (to.name === "login" && auth.isAuthenticated) {
    return { name: "products" };
  }

  // Begränsar åtkomst baserat på roller angivna i route meta (t.ex. ADMIN)
  const requiredRoles = to.meta.roles;
  if (requiredRoles && (!auth.role || !requiredRoles.includes(auth.role))) {
    return { name: "products" };
  }
});

export default router;
