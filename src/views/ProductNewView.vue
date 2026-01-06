<template>
  <div class="max-w-2xl">
    <h1 class="text-2xl font-semibold mb-4">Ny produkt</h1>

    <p v-if="error" class="text-sm text-red-600 mb-3">{{ error }}</p>

    <ProductForm
      :modelValue="model"
      :loading="loading"
      submitLabel="Skapa"
      @submit="createProduct"
      @cancel="goBack"
    />
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";
import ProductForm from "../components/ProductForm.vue";

const router = useRouter();
const loading = ref(false);
const error = ref(null);

const model = reactive({
  name: "",
  sku: "",
  description: "",
  price: "",
  imageUrl: "",
  categoryId: 1, // default
  stockQuantity: "",
});

function goBack() {
  router.push("/products");
}

async function createProduct(payload) {
  loading.value = true;
  error.value = null;
  try {
    await api.post("/products", payload);
    router.push("/products");
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || "Kunde inte skapa produkten";
  } finally {
    loading.value = false;
  }
}
</script>
