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
    meta: { requiresAuth: true },
  },
  {
    path: "/products/:id/edit",
    name: "product-edit",
    component: ProductEditView,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  // 1) Kräver inlogg
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: "login" };
  }

  // 2) Inloggad ska inte till login
  if (to.name === "login" && auth.isAuthenticated) {
    return { name: "products" };
  }

  // 3) ✅ Blockera STAFF från att skapa produkt
  if (to.name === "product-new" && auth.role !== "ADMIN") {
    return { name: "products" };
  }

  // blockera STAFF från new + edit
if ((to.name === "product-new" || to.name === "product-edit") && auth.role !== "ADMIN") {
  return { name: "products" };
}
});

export default router;
