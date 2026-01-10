<template>
<div class="mx-auto max-w-5xl px-4 py-6">
  <div class="max-w-2xl">
    <h1 class="text-2xl font-semibold mb-4">Redigera produkt</h1>

    <p v-if="loading && !loadedOnce">Laddar...</p>
    <p v-else-if="error" class="text-sm text-red-600 mb-3">{{ error }}</p>

    <ProductForm
      v-if="loadedOnce"
      :modelValue="model"
      :loading="saving"
      :categories="categories"
      submitLabel="Spara"
      @submit="saveProduct"
      @cancel="goBack"
    />

    <!-- Lagerjustering -->
    <div class="mt-8 rounded-lg border bg-white p-4">
      <h2 class="text-lg font-semibold mb-3">Justera lagersaldo</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm mb-1">Delta (t.ex. +5 eller -2)</label>
          <input
            v-model.number="stockDelta"
            type="number"
            step="1"
            class="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label class="block text-sm mb-1">Orsak</label>
          <input
            v-model.trim="stockReason"
            class="w-full rounded-md border px-3 py-2"
            placeholder="t.ex. Leverans, Sålt, Retur..."
          />
        </div>
      </div>

      <button
        class="mt-4 rounded-md bg-black text-white px-4 py-2 disabled:opacity-60"
        :disabled="stockLoading || stockDelta === 0 || !stockReason"
        @click="adjustStock"
      >
        {{ stockLoading ? "Uppdaterar..." : "Uppdatera lager" }}
      </button>

      <p v-if="stockError" class="text-sm text-red-600 mt-2">{{ stockError }}</p>
    </div>

    <!-- Lagerhistorik -->
    <div class="mt-6 rounded-lg border bg-white p-4">
      <h2 class="text-lg font-semibold mb-3">Lagerhistorik</h2>

      <p v-if="movementsLoading">Laddar historik...</p>
      <p v-else-if="movementsError" class="text-sm text-red-600">{{ movementsError }}</p>

      <div v-else class="space-y-2">
        <div
          v-for="m in movements"
          :key="m.id"
          class="flex items-center justify-between rounded-md border px-3 py-2"
        >
          <div class="text-sm">
            <span class="font-medium">
              {{ m.delta > 0 ? "+" + m.delta : m.delta }}
            </span>

            <span class="text-gray-600">
              • {{ m.reason }} • {{ movementActor(m) }}
            </span>
          </div>

          <div class="text-xs text-gray-500">
            {{ new Date(m.createdAt).toLocaleString() }}
          </div>
        </div>

        <p v-if="movements.length === 0" class="text-sm text-gray-600">
          Ingen historik ännu.
        </p>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";
import ProductForm from "../components/ProductForm.vue";
import { getCategories } from "../services/categories";

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);

const loading = ref(false);
const saving = ref(false);
const error = ref(null);
const loadedOnce = ref(false);

const categories = ref([]);

const model = reactive({
  id,
  name: "",
  sku: "",
  description: "",
  price: "",
  imageUrl: "",
  stockQuantity: "",
  categoryId: "",
});

const stockDelta = ref(0);
const stockReason = ref("");
const stockLoading = ref(false);
const stockError = ref(null);

const movements = ref([]);
const movementsLoading = ref(false);
const movementsError = ref(null);

function goBack() {
  router.push("/products");
}

function movementActor(m) {
  // Lagerhändelser kan sakna kopplad användare; hanteras med fallback för att undvika krascher i UI
  const role = m?.createdBy?.role;
  const email = m?.createdBy?.email;

  if (role && email) return `${role.toLowerCase()} (${email})`;
  if (role) return role.toLowerCase();
  return "okänd användare";
}

async function loadCategories() {
  categories.value = await getCategories();
}

async function loadProduct() {
  loading.value = true;
  error.value = null;

  try {
    const res = await api.get("/products");
    const p = res.data.find((x) => x.id === id);
    if (!p) throw new Error("Produkten hittades inte");

    Object.assign(model, {
      id: p.id,
      name: p.name ?? "",
      sku: p.sku ?? "",
      description: p.description ?? "",
      price: String(p.price ?? ""),
      imageUrl: p.imageUrl ?? "",
      categoryId: Number(p.categoryId),
      stockQuantity: String(p.stockQuantity ?? ""),
    });

    loadedOnce.value = true;
  } catch (e) {
    error.value =
      e?.response?.data?.message || e?.message || "Kunde inte ladda produkten";
  } finally {
    loading.value = false;
  }
}

async function saveProduct(payload) {
  saving.value = true;
  error.value = null;
  try {
    await api.put(`/products/${id}`, payload);
    router.push("/products");
  } catch (e) {
    error.value =
      e?.response?.data?.message || e?.message || "Kunde inte spara produkten";
  } finally {
    saving.value = false;
  }
}

async function adjustStock() {
  stockLoading.value = true;
  stockError.value = null;

  try {
    const res = await api.patch(`/products/${id}/stock`, {
      delta: stockDelta.value,
      reason: stockReason.value,
    });

    model.stockQuantity = String(res.data.stockQuantity);

    stockDelta.value = 0;
    stockReason.value = "";

    await fetchMovements();
  } catch (e) {
    stockError.value =
      e?.response?.data?.message || e?.message || "Kunde inte uppdatera lagret";
  } finally {
    stockLoading.value = false;
  }
}

async function fetchMovements() {
  movementsLoading.value = true;
  movementsError.value = null;
  try {
    const res = await api.get(`/products/${id}/stock-movements`);
    movements.value = res.data;
  } catch (e) {
    movementsError.value =
      e?.response?.data?.message || e?.message || "Kunde inte hämta historik";
  } finally {
    movementsLoading.value = false;
  }
}

onMounted(async () => {
  await loadCategories();
  await loadProduct();
  await fetchMovements();
});
</script>
