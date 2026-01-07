<template>
  <Toast
    v-if="toast"
    :key="toast.id"
    :title="toast.title"
    :message="toast.message"
    :type="toast.type"
  />

  <!-- ✅ ConfirmModal ligger här: direkt under Toast, innan resten av sidan -->
  <ConfirmModal
    :open="confirmOpen"
    title="Ta bort produkt"
    :message="`Vill du verkligen ta bort '${pendingDeleteName}'? Det går inte att ångra.`"
    confirmLabel="Ta bort"
    :loading="deletingId === pendingDeleteId"
    @cancel="closeConfirm"
    @confirm="confirmDelete"
  />

<div class="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-rose-50">
    <!-- Sticky toolbar -->
<div class="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-rose-100">
      <div class="max-w-5xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h1 class="text-xl font-semibold text-black-900">Produkter</h1>
            <p class="text-sm text-black-500">
              Sök och filtrera produkter. Justera lagersaldo under “Edit”.
            </p>
          </div>

          <router-link
            v-if="isAdmin"
            to="/products/new"
            class="rounded-full bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 text-sm shadow-sm transition"
          >
            Ny produkt
          </router-link>
        </div>

        <!-- Search + filter -->
        <div class="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="sm:col-span-2 flex gap-2">
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

          <select
            v-model.number="selectedCategoryId"
            class="w-full rounded-md border px-3 py-2"
          >
            <option :value="0">Alla kategorier</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
        </div>

        <!-- Quick stats -->
        <div class="mt-3 flex flex-wrap gap-2 text-sm">
          <span class="rounded-full border px-2 py-1 bg-white">
            Visar: <b>{{ filteredProducts.length }}</b> av
            <b>{{ products.length }}</b>
          </span>
          <span class="rounded-full border px-2 py-1 bg-white">
            Lågt lager: <b>{{ lowStockCount }}</b>
          </span>
          <span class="rounded-full border px-2 py-1 bg-white">
            Slut: <b>{{ outOfStockCount }}</b>
          </span>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-5xl mx-auto px-4 py-6">
      <p v-if="loading">Laddar...</p>
      <p v-else-if="error" class="text-red-600 text-sm">{{ error }}</p>

<div class="rounded-2xl border border-rose-100 bg-white shadow-sm overflow-hidden">
        <!-- Header row (desktop) -->
<div
  class="hidden sm:grid grid-cols-11 gap-2 px-4 py-2 text-xs font-medium text-gray-500 border-b bg-gray-50"
>
  <div class="col-span-4">Produkt</div>
  <div class="col-span-2">SKU</div>
  <div class="col-span-2">Kategori</div>
  <div class="col-span-1 text-right">Pris</div>
  <div class="col-span-1 text-center">Lager</div>
  <div class="col-span-1 text-right">Åtgärder</div>
</div>


        <!-- Empty -->
        <div
          v-if="filteredProducts.length === 0"
          class="p-6 text-sm text-gray-600"
        >
          Inga produkter matchar din sökning/filter.
        </div>

        <!-- Rows -->
        <div
          v-for="p in filteredProducts"
          :key="p.id"
          class="border-b last:border-b-0 px-4 py-3"
        >
          <div class="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
            <!-- Produkt -->
            <div class="sm:col-span-4 flex items-center gap-3 min-w-0">
              <img
                :src="p.imageUrl"
                alt=""
                class="h-10 w-10 rounded-md border object-cover bg-gray-50"
                @error="onImgError"
              />

              <div class="min-w-0">
                <div class="font-medium truncate flex items-center gap-2">
                  <span class="truncate">{{ p.name }}</span>

                  <!-- Desktop status badge -->
                  <span
                    class="hidden sm:inline-flex rounded-full px-2 py-0.5 text-xs border"
                    :class="stockBadgeClass(Number(p.stockQuantity))"
                  >
                    {{ stockBadgeText(Number(p.stockQuantity)) }}
                  </span>
                </div>

                <div class="text-xs text-gray-500 truncate">#{{ p.id }}</div>
              </div>
            </div>

            <!-- SKU -->
            <div class="sm:col-span-2 text-sm text-gray-700">
              {{ p.sku }}
            </div>

            <!-- Kategori -->
            <div class="sm:col-span-2 text-sm text-gray-700">
              {{ categoryNameById.get(p.categoryId) || "-" }}
            </div>

            <!-- Pris -->
<div class="sm:col-span-1 text-sm text-gray-700 text-right tabular-nums whitespace-nowrap">
  {{ formatPrice(p.price) }}
</div>

            <!-- Lager (endast antal) -->
<div class="sm:col-span-1 flex items-center justify-center">
              <span
                class="inline-flex items-center justify-center min-w-[2.5rem] rounded-md border px-2 py-0.5 text-sm font-semibold tabular-nums"
                :class="
                  Number(p.stockQuantity) < 5
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                "
              >
                {{ p.stockQuantity }}
              </span>
            </div>
<div class="sm:col-span-1 flex justify-end">
  <div class="inline-flex items-center gap-1">
    <router-link
      :to="`/products/${p.id}/edit`"
      class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-violet-200 bg-white text-violet-700 shadow-sm hover:bg-violet-50 transition"
      title="Redigera"
      aria-label="Redigera"
    >
      <!-- Pencil -->
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    </router-link>

    <button
      v-if="isAdmin"
      type="button"
      @click="askDelete(p.id, p.name)"
      class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-700 shadow-sm hover:bg-rose-50 transition disabled:opacity-50"
      :disabled="deletingId === p.id"
      title="Ta bort"
      aria-label="Ta bort"
    >
      <!-- Trash -->
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </svg>
    </button>
  </div>
</div>
</div>
          <!-- Mobile meta row -->
          <div class="sm:hidden mt-2 flex flex-wrap gap-2 text-xs">
            <span
              class="rounded-full px-2 py-0.5 border"
              :class="stockBadgeClass(Number(p.stockQuantity))"
            >
              {{ stockBadgeText(Number(p.stockQuantity)) }}
            </span>

            <span class="rounded-full px-2 py-0.5 border text-gray-600">
              {{ categoryNameById.get(p.categoryId) || "-" }}
            </span>

            <span class="rounded-full px-2 py-0.5 border text-gray-600">
              {{ p.sku }}
            </span>

            <span class="rounded-full px-2 py-0.5 border text-gray-600">
              {{ formatPrice(p.price) }}
            </span>

            <span class="rounded-full px-2 py-0.5 border text-gray-700 bg-gray-50">
              Lager: {{ p.stockQuantity }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import api from "../services/api";
import { getCategories } from "../services/categories";
import Toast from "../components/Toast.vue";
import ConfirmModal from "../components/ConfirmModal.vue";

const products = ref([]);
const loading = ref(false);
const error = ref(null);
const deletingId = ref(null);
const toast = ref(null);

// sök + kategori-filter
const query = ref("");
const selectedCategoryId = ref(0); // 0 = alla

// TODO: koppla till din auth-store när du vill.
// Ex: const auth = useAuthStore(); const isAdmin = computed(() => auth.role === 'ADMIN')
const isAdmin = computed(() => true);

// kategorier + lookup (id -> name)
const categories = ref([]);
const categoryNameById = computed(() => {
  const map = new Map();
  for (const c of categories.value) map.set(c.id, c.name);
  return map;
});

// ✅ confirm modal state
const confirmOpen = ref(false);
const pendingDeleteId = ref(null);
const pendingDeleteName = ref("");

function askDelete(id, name) {
  pendingDeleteId.value = id;
  pendingDeleteName.value = name || `produkt #${id}`;
  confirmOpen.value = true;
}

function closeConfirm() {
  confirmOpen.value = false;
  pendingDeleteId.value = null;
  pendingDeleteName.value = "";
}

async function fetchProducts() {
  loading.value = true;
  error.value = null;

  try {
    const res = await api.get("/products");
    products.value = res.data;
  } catch (e) {
    const msg =
      e?.response?.data?.message || e?.message || "Kunde inte hämta produkter";

    error.value = msg;
    showToast({ title: "Fel", message: msg, type: "error" });
  } finally {
    loading.value = false;
  }
}

async function fetchCategories() {
  try {
    categories.value = await getCategories();
  } catch (e) {
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
      Number(selectedCategoryId.value) === 0 ||
      Number(p.categoryId) === Number(selectedCategoryId.value);

    return matchesQuery && matchesCategory;
  });
});

const lowStockCount = computed(
  () =>
    filteredProducts.value.filter(
      (p) => Number(p.stockQuantity) > 0 && Number(p.stockQuantity) < 5
    ).length
);

const outOfStockCount = computed(
  () => filteredProducts.value.filter((p) => Number(p.stockQuantity) === 0).length
);

function stockBadgeText(qty) {
  if (qty === 0) return "SLUT";
  if (qty < 5) return "LÅGT I LAGER";
  return "OK";
}

function stockBadgeClass(qty) {
  if (qty === 0) return "border-rose-300 text-rose-800 bg-rose-50";
  if (qty < 5) return "border-amber-200 text-amber-800 bg-amber-50";
  return "border-violet-200 text-violet-700 bg-violet-50";
}

function formatPrice(price) {
  const n = Number(price);
  if (Number.isNaN(n)) return "-";
  return `${n.toFixed(0)} kr`;
}

function onImgError(e) {
  e.target.src = "/placeholder.png";
}

async function confirmDelete() {
  const id = pendingDeleteId.value;
  if (!id) return;

  deletingId.value = id;

  try {
    await api.delete(`/products/${id}`);
    await fetchProducts();

    showToast({
      title: "Borttagen",
      message: `Produkten '${pendingDeleteName.value}' togs bort.`,
      type: "success",
    });

    closeConfirm();
  } catch (e) {
    showToast({
      title: "Fel",
      message: e?.response?.data?.message || "Kunde inte ta bort produkten",
      type: "error",
    });
  } finally {
    deletingId.value = null;
  }
}

function showToast({ title, message, type = "info" }) {
  toast.value = { title, message, type, id: Date.now() };
}

onMounted(async () => {
  await Promise.all([fetchProducts(), fetchCategories()]);
});
</script>
