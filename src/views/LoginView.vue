<template>
  <div class="max-w-md">
    <h1 class="text-2xl font-semibold mb-4">Logga in</h1>

    <form class="space-y-3" @submit.prevent="onSubmit">
      <div>
        <label class="block text-sm mb-1">Email</label>
        <input
          v-model.trim="email"
          type="email"
          class="w-full rounded-md border px-3 py-2"
          required
        />
      </div>

      <div>
        <label class="block text-sm mb-1">Lösenord</label>
        <input
          v-model="password"
          type="password"
          class="w-full rounded-md border px-3 py-2"
          required
        />
      </div>

      <p v-if="auth.error" class="text-sm text-red-600">
        {{ auth.error }}
      </p>

      <button
        class="rounded-md bg-black text-white px-4 py-2 disabled:opacity-60"
        :disabled="auth.loading"
      >
        {{ auth.loading ? "Loggar in..." : "Logga in" }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");

async function onSubmit() {
  try {
    await auth.login(email.value, password.value);
    router.push("/products");
  } catch {
    // fel hanteras i store (auth.error)
  }
}
</script>
