<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Produkter</h1>
      <button
        class="rounded-md border px-3 py-2 hover:bg-gray-100"
        @click="fetchProducts"
      >
        Uppdatera
      </button>
    </div>

    <p v-if="loading">Laddar...</p>
    <p v-else-if="error" class="text-red-600 text-sm">{{ error }}</p>

    <div v-else class="space-y-2">
      <div
        v-for="p in products"
        :key="p.id"
        class="rounded-lg border bg-white p-3 flex items-center justify-between"
      >
        <div>
          <div class="font-medium">{{ p.name }}</div>
          <div class="text-sm text-gray-600">
            Pris: {{ p.price }} • Lager: {{ p.stockQuantity }}
          </div>
        </div>
        <div class="text-xs text-gray-500">#{{ p.id }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import api from "../services/api";

const products = ref([]);
const loading = ref(false);
const error = ref(null);

async function fetchProducts() {
  loading.value = true;
  error.value = null;
  try {
    const res = await api.get("/products");
    products.value = res.data;
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || "Kunde inte hämta produkter";
  } finally {
    loading.value = false;
  }
}

onMounted(fetchProducts);
</script>
