<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border px-4 py-3 shadow-lg"
      :class="variantClass"
    >
      <div class="flex items-start gap-2">
        <span class="font-medium">{{ title }}</span>
        <button
          class="ml-auto text-sm opacity-60 hover:opacity-100"
          @click="close"
        >
          ✕
        </button>
      </div>

      <p v-if="message" class="text-sm mt-1 opacity-90">
        {{ message }}
      </p>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  title: String,
  message: String,
  type: {
    type: String,
    default: "info", // info | success | error
  },
  duration: {
    type: Number,
    default: 3000,
  },
});

const visible = ref(true);

const variantClass = computed(() => {
  if (props.type === "success")
    return "bg-green-50 border-green-200 text-green-800";
  if (props.type === "error")
    return "bg-red-50 border-red-200 text-red-800";
  return "bg-gray-50 border-gray-200 text-gray-800";
});

function close() {
  visible.value = false;
}

watch(
  () => props.duration,
  (d) => {
    if (d > 0) setTimeout(close, d);
  },
  { immediate: true }
);
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
