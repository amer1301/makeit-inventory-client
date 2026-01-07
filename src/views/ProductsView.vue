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

    <!-- Sök + kategori-filter + info -->
    <div class="mb-4 flex flex-col gap-2">
      <div
        class="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between"
      >
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

      <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
        <label class="text-sm text-gray-700">Kategori:</label>
        <select
          v-model="selectedCategoryId"
          class="rounded-md border px-3 py-2 w-full sm:w-64"
        >
          <option value="all">Alla</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
      </div>
    </div>

    <p v-if="loading">Laddar...</p>
    <p v-else-if="error" class="text-red-600 text-sm">{{ error }}</p>

    <div v-else class="space-y-2">
      <p v-if="filteredProducts.length === 0" class="text-sm text-gray-600">
        Inga produkter matchar din sökning/filter.
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
            <!-- Namn + badges -->
            <div class="font-medium truncate flex items-center gap-2">
              <span class="truncate">{{ p.name }}</span>

              <!-- Low stock badge -->
              <span
                v-if="Number(p.stockQuantity) < 5"
                class="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200"
              >
                LOW STOCK
              </span>

              <!-- Kategori badge -->
              <span
                class="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 border"
              >
                {{ categoryNameById.get(p.categoryId) || `Kategori ${p.categoryId}` }}
              </span>

              <!-- SKU -->
              <span class="text-xs text-gray-500">
                ({{ p.sku }})
              </span>
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
import { getCategories } from "../services/categories";

const products = ref([]);
const loading = ref(false);
const error = ref(null);
const deletingId = ref(null);

// sök + kategori-filter
const query = ref("");
const selectedCategoryId = ref("all");

// kategorier + lookup (id -> name)
const categories = ref([]);
const categoryNameById = computed(() => {
  const map = new Map();
  for (const c of categories.value) map.set(c.id, c.name);
  return map;
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

async function fetchCategories() {
  try {
    categories.value = await getCategories();
  } catch (e) {
    // inte kritiskt – produkterna kan fortfarande visas
    console.warn("Kunde inte hämta kategorier", e);
  }
}

const filteredProducts = computed(() => {
  const q = query.value.trim().toLowerCase();

  return products.value.filter((p) => {
    const name = String(p.name ?? "").toLowerCase();
    const sku = String(p.sku ?? "").toLowerCase();

    const matchesQuery = !q || name.includes(q) || sku.includes(q);

    const matchesCategory =
      selectedCategoryId.value === "all" ||
      Number(p.categoryId) === Number(selectedCategoryId.value);

    return matchesQuery && matchesCategory;
  });
});

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

onMounted(async () => {
  await Promise.all([fetchProducts(), fetchCategories()]);
});
</script>
