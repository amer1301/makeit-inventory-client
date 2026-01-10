<template>
  <div
    class="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-rose-50 text-gray-900"
  >
    <header class="border-b border-rose-100 bg-white/70 backdrop-blur">
      <div
        class="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between"
      >
        <router-link to="/products" class="font-semibold text-violet-900">
          MakeIt Inventory
        </router-link>

        <div class="flex items-center gap-4">
          <router-link
            v-if="!auth.isAuthenticated"
            to="/login"
            class="text-sm text-violet-700 hover:text-violet-900 underline underline-offset-4"
          >
            Login
          </router-link>

          <template v-else>
            <span class="text-sm text-violet-900/80">
              Inloggad som:
              <span class="font-semibold">
                {{ auth.roleLabel }}
              </span>
            </span>

            <button
              class="text-sm rounded-full border border-violet-200 bg-white/70 px-4 py-1.5 text-violet-700 hover:bg-violet-50 transition"
              @click="handleLogout"
            >
              Logout
            </button>
          </template>
        </div>
      </div>
    </header>

    <main class="w-full">
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
