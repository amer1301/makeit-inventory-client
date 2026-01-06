<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Produkter</h1>

      <router-link
        to="/products/new"
        class="rounded-md bg-black text-white px-4 py-2"
      >
        Ny produkt
      </router-link>
    </div>

    <!-- Sök + info -->
    <div class="mb-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
      <div class="flex gap-2 w-full sm:max-w-md">
        <input
          v-model.trim="query"
          class="w-full rounded-md border px-3 py-2"
          placeholder="Sök på namn eller SKU..."
        />
        <button
          v-if="query"
          class="rounded-md border px-3 py-2 hover:bg-gray-100"
          @click="query = ''"
        >
          Rensa
        </button>
      </div>

      <div class="text-sm text-gray-600">
        Visar {{ filteredProducts.length }} av {{ products.length }}
      </div>
    </div>

    <p v-if="loading">Laddar...</p>
    <p v-else-if="error" class="text-red-600 text-sm">{{ error }}</p>

    <div v-else class="space-y-2">
      <p v-if="filteredProducts.length === 0" class="text-sm text-gray-600">
        Inga produkter matchar din sökning.
      </p>

      <div
        v-for="p in filteredProducts"
        :key="p.id"
        class="rounded-lg border bg-white p-3 flex items-center justify-between gap-4"
      >
        <div class="flex items-center gap-4 min-w-0">
          <img
            :src="p.imageUrl"
            alt=""
            class="h-14 w-14 rounded object-cover border"
            @error="(e) => (e.target.src = '/placeholder.png')"
          />

          <div class="min-w-0">
            <div class="font-medium truncate">
              {{ p.name }}
              <span class="ml-2 text-xs text-gray-500">({{ p.sku }})</span>
            </div>
            <div class="text-sm text-gray-600">
              Pris: {{ p.price }} • Lager: {{ p.stockQuantity }}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <router-link
            :to="`/products/${p.id}/edit`"
            class="rounded-md border px-3 py-1 hover:bg-gray-100"
          >
            Edit
          </router-link>

          <button
            class="rounded-md border px-3 py-1 hover:bg-gray-100"
            @click="onDelete(p.id)"
            :disabled="deletingId === p.id"
          >
            {{ deletingId === p.id ? "Tar bort..." : "Delete" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import api from "../services/api";

const products = ref([]);
const loading = ref(false);
const error = ref(null);
const deletingId = ref(null);

const query = ref("");

const filteredProducts = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return products.value;

  return products.value.filter((p) => {
    const name = String(p.name ?? "").toLowerCase();
    const sku = String(p.sku ?? "").toLowerCase();
    return name.includes(q) || sku.includes(q);
  });
});

async function fetchProducts() {
  loading.value = true;
  error.value = null;
  try {
    const res = await api.get("/products");
    products.value = res.data;
  } catch (e) {
    error.value =
      e?.response?.data?.message || e?.message || "Kunde inte hämta produkter";
  } finally {
    loading.value = false;
  }
}

async function onDelete(id) {
  const ok = confirm("Vill du verkligen ta bort produkten?");
  if (!ok) return;

  deletingId.value = id;
  try {
    await api.delete(`/products/${id}`);
    await fetchProducts();
  } catch (e) {
    alert(e?.response?.data?.message || "Kunde inte ta bort produkten");
  } finally {
    deletingId.value = null;
  }
}

onMounted(fetchProducts);
</script>
