<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <header class="border-b bg-white">
      <div class="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <router-link to="/products" class="font-semibold">
          MakeIt Inventory
        </router-link>

        <div class="flex items-center gap-3">
          <router-link
            v-if="!auth.isAuthenticated"
            to="/login"
            class="text-sm underline"
          >
            Login
          </router-link>

          <button
            v-else
            class="text-sm rounded-md border px-3 py-1 hover:bg-gray-100"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from "./stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

function handleLogout() {
  auth.logout();
  router.push("/login");
}
</script>
