<template>
  <div class="max-w-2xl">
    <h1 class="text-2xl font-semibold mb-4">Ny produkt</h1>

    <p v-if="error" class="text-sm text-red-600 mb-3">{{ error }}</p>

    <ProductForm
      :modelValue="model"
      :loading="loading"
      :categories="categories"
      submitLabel="Skapa"
      @submit="createProduct"
      @cancel="goBack"
    />
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";
import ProductForm from "../components/ProductForm.vue";
import { getCategories } from "../services/categories";

const router = useRouter();
const loading = ref(false);
const error = ref(null);

const categories = ref([]);

const model = reactive({
  name: "",
  sku: "",
  description: "",
  price: "",
  imageUrl: "",
  categoryId: "",
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
    error.value =
      e?.response?.data?.message || e?.message || "Kunde inte skapa produkten";
  } finally {
    loading.value = false;
  }
}

async function loadCategories() {
  categories.value = await getCategories();

  if (!model.categoryId && categories.value.length > 0) {
    model.categoryId = categories.value[0].id;
  }
}

onMounted(async () => {
  await loadCategories();
});
</script>
