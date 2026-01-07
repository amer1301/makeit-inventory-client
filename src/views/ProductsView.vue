<template>
  <Toast
    v-if="toast"
    :key="toast.id"
    :title="toast.title"
    :message="toast.message"
    :type="toast.type"
  />

  <!-- Confirm modal: läggs högt upp så den alltid kan visas -->
  <ConfirmModal
    :open="confirmOpen"
    title="Ta bort produkt"
    :message="`Vill du verkligen ta bort '${pendingDeleteName}'? Det går inte att ångra.`"
    confirmLabel="Ta bort"
    :loading="deletingId === pendingDeleteId"
    @cancel="closeConfirm"
    @confirm="confirmDelete"
  />

  <!-- PAGE -->
  <div class="w-full">
    <!-- Toolbar -->
    <div class="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-rose-100">
      <div class="mx-auto max-w-5xl px-4 py-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">Produkter</h1>
            <p class="text-sm text-gray-600">
              Sök och filtrera produkter. Justera lagersaldo under “Edit”.
            </p>
          </div>

          <router-link
            v-if="isAdmin"
            to="/products/new"
            class="shrink-0 rounded-full bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 text-sm shadow-sm transition"
          >
            Ny produkt
          </router-link>
        </div>

        <!-- Search + filter -->
        <div class="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div class="lg:col-span-2 flex gap-2">
            <input
              v-model.trim="query"
              class="w-full rounded-xl border border-rose-100 bg-white px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
              placeholder="Sök på namn eller SKU..."
            />
            <button
              v-if="query"
              class="rounded-xl border border-rose-100 bg-white px-4 py-2.5 text-sm hover:bg-rose-50 transition"
              @click="query = ''"
            >
              Rensa
            </button>
          </div>

          <select
            v-model.number="selectedCategoryId"
            class="w-full rounded-xl border border-rose-100 bg-white px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
          >
            <option :value="0">Alla kategorier</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
        </div>

        <!-- Stats -->
        <div class="mt-3 flex flex-wrap gap-2 text-sm">
          <span class="rounded-full border border-rose-100 bg-white/80 px-3 py-1">
            Visar: <b>{{ filteredProducts.length }}</b> av <b>{{ products.length }}</b>
          </span>
          <span class="rounded-full border border-rose-100 bg-white/80 px-3 py-1">
            Lågt lager: <b>{{ lowStockCount }}</b>
          </span>
          <span class="rounded-full border border-rose-100 bg-white/80 px-3 py-1">
            Slut: <b>{{ outOfStockCount }}</b>
          </span>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="mx-auto max-w-5xl px-4 py-6">
      <p v-if="loading" class="text-sm text-gray-600">Laddar...</p>
      <p v-else-if="error" class="text-sm text-rose-700">{{ error }}</p>

      <div v-else class="rounded-2xl border border-rose-100 bg-white shadow-sm overflow-hidden">
        <!-- Desktop header (lg+) -->
        <div
          class="hidden lg:grid items-center gap-3 px-4 py-3 text-xs font-medium text-gray-500 bg-rose-50/50 border-b border-rose-100"
          style="grid-template-columns: 1.7fr 0.9fr 0.9fr 0.7fr 0.5fr 84px;"
        >
          <div>Produkt</div>
          <div>SKU</div>
          <div>Kategori</div>
          <div class="text-right">Pris</div>
          <div class="text-center">Lager</div>
          <div class="text-right"> </div>
        </div>

        <!-- Empty -->
        <div v-if="filteredProducts.length === 0" class="p-6 text-sm text-gray-600">
          Inga produkter matchar din sökning/filter.
        </div>

        <!-- Rows -->
        <div v-for="p in filteredProducts" :key="p.id" class="border-b border-rose-100 last:border-b-0">
          <!-- Desktop row (lg+) -->
          <div
            class="hidden lg:grid items-center gap-3 px-4 py-3"
            style="grid-template-columns: 1.7fr 0.9fr 0.9fr 0.7fr 0.5fr 84px;"
          >
            <!-- Produkt -->
            <div class="flex items-center gap-3 min-w-0">
              <img
                :src="p.imageUrl"
                alt=""
                class="h-10 w-10 rounded-lg border border-rose-100 object-cover bg-rose-50"
                @error="onImgError"
              />
              <div class="min-w-0">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="font-medium text-gray-900 truncate">{{ p.name }}</span>
                  <span
                    class="inline-flex rounded-full px-2 py-0.5 text-[11px] border"
                    :class="stockBadgeClass(Number(p.stockQuantity))"
                  >
                    {{ stockBadgeText(Number(p.stockQuantity)) }}
                  </span>
                </div>
                <div class="text-xs text-gray-500">#{{ p.id }}</div>
              </div>
            </div>

            <!-- SKU -->
            <div class="text-sm text-gray-700 truncate">{{ p.sku }}</div>

            <!-- Kategori -->
            <div class="text-sm text-gray-700 truncate">
              {{ categoryNameById.get(p.categoryId) || "-" }}
            </div>

            <!-- Pris -->
            <div class="text-sm text-gray-700 text-right tabular-nums whitespace-nowrap">
              {{ formatPrice(p.price) }}
            </div>

            <!-- Lager -->
            <div class="flex justify-center">
              <span
                class="inline-flex items-center justify-center min-w-[2.5rem] rounded-md border px-2 py-0.5 text-sm font-semibold tabular-nums"
                :class="stockPillClass(Number(p.stockQuantity))"
              >
                {{ p.stockQuantity }}
              </span>
            </div>

            <!-- Actions (ikon-knappar längst höger) -->
            <div class="flex justify-end gap-2">
              <router-link
                :to="`/products/${p.id}/edit`"
                class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-violet-200 bg-white text-violet-700 hover:bg-violet-50 transition"
                title="Redigera"
                aria-label="Redigera"
              >
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
              </router-link>

              <button
                v-if="isAdmin"
                type="button"
                @click="askDelete(p.id, p.name)"
                class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 transition disabled:opacity-50"
                :disabled="deletingId === p.id"
                title="Ta bort"
                aria-label="Ta bort"
              >
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

          <!-- Mobile/Tablet card (<lg) -->
          <div class="lg:hidden px-4 py-4">
            <div class="flex items-start gap-3">
              <img
                :src="p.imageUrl"
                alt=""
                class="h-12 w-12 rounded-xl border border-rose-100 object-cover bg-rose-50"
                @error="onImgError"
              />

              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <div class="font-medium text-gray-900 truncate">{{ p.name }}</div>
                  <span
                    class="inline-flex rounded-full px-2 py-0.5 text-[11px] border"
                    :class="stockBadgeClass(Number(p.stockQuantity))"
                  >
                    {{ stockBadgeText(Number(p.stockQuantity)) }}
                  </span>
                </div>

                <div class="mt-1 text-xs text-gray-600">
                  <span class="font-medium">SKU:</span> {{ p.sku }}
                </div>
                <div class="mt-0.5 text-xs text-gray-600">
                  <span class="font-medium">Kategori:</span> {{ categoryNameById.get(p.categoryId) || "-" }}
                </div>
              </div>

              <!-- Lager + pris + actions till höger -->
              <div class="flex flex-col items-end gap-2">
                <div class="text-sm text-gray-700 tabular-nums whitespace-nowrap">
                  {{ formatPrice(p.price) }}
                </div>

                <span
                  class="inline-flex items-center justify-center min-w-[2.5rem] rounded-md border px-2 py-0.5 text-sm font-semibold tabular-nums"
                  :class="stockPillClass(Number(p.stockQuantity))"
                >
                  {{ p.stockQuantity }}
                </span>

                <div class="flex gap-2">
                  <router-link
                    :to="`/products/${p.id}/edit`"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-violet-200 bg-white text-violet-700 hover:bg-violet-50 transition"
                    title="Redigera"
                    aria-label="Redigera"
                  >
                    <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                  </router-link>

                  <button
                    v-if="isAdmin"
                    type="button"
                    @click="askDelete(p.id, p.name)"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 transition disabled:opacity-50"
                    :disabled="deletingId === p.id"
                    title="Ta bort"
                    aria-label="Ta bort"
                  >
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

            <div class="mt-2 text-xs text-gray-500">#{{ p.id }}</div>
          </div>
        </div>
      </div>

      <p class="mt-3 text-xs text-gray-500">
        Tips: gå in på <b>Edit</b> för att justera lagersaldo och se historik.
      </p>
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
const selectedCategoryId = ref(0);

// TODO: koppla till din auth-store när du vill
const isAdmin = computed(() => true);

// kategorier
const categories = ref([]);
const categoryNameById = computed(() => {
  const map = new Map();
  for (const c of categories.value) map.set(c.id, c.name);
  return map;
});

// confirm modal state
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
    const msg = e?.response?.data?.message || e?.message || "Kunde inte hämta produkter";
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
  () => filteredProducts.value.filter((p) => Number(p.stockQuantity) > 0 && Number(p.stockQuantity) < 5).length
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

function stockPillClass(qty) {
  // lager-pill: neutral/varning
  if (qty < 5) return "bg-amber-50 border-amber-200 text-amber-900";
  return "bg-rose-50 border-rose-200 text-rose-900";
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
