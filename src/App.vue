<template>
  <!-- ✅ Hela sidans bakgrund (även “grå ytorna” på sidorna) -->
  <div class="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-rose-50 text-gray-900">
    <!-- Header -->
    <header class="border-b border-rose-100 bg-white/70 backdrop-blur">
      <div class="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <router-link to="/products" class="font-semibold text-violet-900">
          MakeIt Inventory
        </router-link>

        <div class="flex items-center gap-3">
          <router-link
            v-if="!auth.isAuthenticated"
            to="/login"
            class="text-sm text-violet-700 hover:text-violet-900 underline underline-offset-4"
          >
            Login
          </router-link>

          <button
            v-else
            class="text-sm rounded-full border border-violet-200 bg-white/70 px-4 py-1.5 text-violet-700 hover:bg-violet-50 transition"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Content -->
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
