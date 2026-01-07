<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center"
        aria-modal="true"
        role="dialog"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/40"
          @click="emit('cancel')"
        />

        <!-- Panel -->
        <div
          class="relative w-full max-w-md mx-4 rounded-xl bg-white shadow-lg border"
        >
          <div class="p-5">
            <h3 class="text-lg font-semibold">
              {{ title }}
            </h3>

            <p v-if="message" class="text-sm text-gray-600 mt-2">
              {{ message }}
            </p>
          </div>

          <div class="flex items-center justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-xl">
            <button
              class="rounded-md border px-4 py-2 text-sm hover:bg-white disabled:opacity-60"
              :disabled="loading"
              @click="emit('cancel')"
            >
              Avbryt
            </button>

            <button
              class="rounded-md bg-red-600 text-white px-4 py-2 text-sm hover:bg-red-700 disabled:opacity-60"
              :disabled="loading"
              @click="emit('confirm')"
            >
              {{ loading ? "Tar bort..." : confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: "Bekräfta" },
  message: { type: String, default: "" },
  confirmLabel: { type: String, default: "Bekräfta" },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["confirm", "cancel"]);
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
