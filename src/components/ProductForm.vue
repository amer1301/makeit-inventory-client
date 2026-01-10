<template>
  <form class="space-y-4" @submit.prevent="$emit('submit', normalizedPayload)">
    <div>
      <label class="block text-sm mb-1">Namn</label>
      <input v-model.trim="form.name" class="w-full rounded-md border px-3 py-2" required />
    </div>

    <div>
      <label class="block text-sm mb-1">SKU</label>
      <input
        v-model.trim="form.sku"
        class="w-full rounded-md border px-3 py-2"
        required
        placeholder="t.ex. MAKEIT-001"
      />
      <p class="text-xs text-gray-500 mt-1">Måste vara unik.</p>
    </div>

    <div>
      <label class="block text-sm mb-1">Beskrivning</label>
      <textarea
        v-model.trim="form.description"
        class="w-full rounded-md border px-3 py-2"
        rows="3"
        required
      ></textarea>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm mb-1">Pris</label>
        <input
          v-model="form.price"
          type="number"
          step="0.01"
          min="0"
          class="w-full rounded-md border px-3 py-2"
          required
        />
      </div>

      <div>
        <label class="block text-sm mb-1">Kategori</label>
        <select
          v-model="form.categoryId"
          class="w-full rounded-md border px-3 py-2"
          required
        >
          <option disabled value="">Välj kategori...</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
      </div>
    </div>

    <div>
      <label class="block text-sm mb-1">Bild-URL</label>
      <input
        v-model.trim="form.imageUrl"
        class="w-full rounded-md border px-3 py-2"
        required
        placeholder="https://..."
      />
    </div>

    <div>
      <label class="block text-sm mb-1">Startsaldo (valfritt)</label>
      <input
        v-model="form.stockQuantity"
        type="number"
        step="1"
        class="w-full rounded-md border px-3 py-2"
      />
      <p class="text-xs text-gray-500 mt-1">
        Kan lämnas tomt – backend har default 0.
      </p>
    </div>

    <div class="flex gap-2">
      <button class="rounded-md bg-black text-white px-4 py-2 disabled:opacity-60" :disabled="loading">
        {{ loading ? "Sparar..." : submitLabel }}
      </button>
      <button
        type="button"
        class="rounded-md border px-4 py-2 hover:bg-gray-100"
        @click="$emit('cancel')"
      >
        Avbryt
      </button>
    </div>
  </form>
</template>


<script setup>
import { computed, reactive, watch } from "vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  submitLabel: { type: String, default: "Spara" },
  categories: { type: Array, default: () => [] },
});
defineEmits(["submit", "cancel"]);

const form = reactive({
  name: "",
  sku: "",
  description: "",
  price: "",
  imageUrl: "",
  categoryId: "",
  stockQuantity: "",
  ...props.modelValue,
});

watch(
  () => props.modelValue,
  (v) => Object.assign(form, v),
  { deep: true }
);

const normalizedPayload = computed(() => ({
  name: String(form.name ?? "").trim(),
  sku: String(form.sku ?? "").trim(),
  description: String(form.description ?? "").trim(),
  imageUrl: String(form.imageUrl ?? "").trim(),
  categoryId: Number(form.categoryId),
  // Prisma hanterar Decimal; här normaliseras priset till number innan API-anrop
  price: Number(form.price),
  ...(form.stockQuantity === "" || form.stockQuantity === null || form.stockQuantity === undefined
    ? {}
    : { stockQuantity: Number(form.stockQuantity) }),
}));
</script>
