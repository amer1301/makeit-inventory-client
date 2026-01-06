<template>
  <div class="max-w-2xl">
    <h1 class="text-2xl font-semibold mb-4">Redigera produkt</h1>

    <p v-if="loading && !loadedOnce">Laddar...</p>
    <p v-else-if="error" class="text-sm text-red-600 mb-3">{{ error }}</p>

    <ProductForm
      v-if="loadedOnce"
      :modelValue="model"
      :loading="saving"
      submitLabel="Spara"
      @submit="saveProduct"
      @cancel="goBack"
    />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";
import ProductForm from "../components/ProductForm.vue";

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);

const loading = ref(false);
const saving = ref(false);
const error = ref(null);
const loadedOnce = ref(false);

const model = reactive({
  id,
  name: "",
  description: "",
  price: 0,
  imageUrl: "",
  stockQuantity: 0,
  categoryId: null,
});

function goBack() {
  router.push("/products");
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
  categoryId: String(p.categoryId ?? ""),
  stockQuantity: String(p.stockQuantity ?? ""),
});


    loadedOnce.value = true;
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || "Kunde inte ladda produkten";
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
    error.value = e?.response?.data?.message || e?.message || "Kunde inte spara produkten";
  } finally {
    saving.value = false;
  }
}

onMounted(loadProduct);
</script>
