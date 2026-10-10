<script setup>
import { X } from 'lucide-vue-next'

defineProps({
  title: { type: String, required: true }
})
const emit = defineEmits(['close'])
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-head">
        <h3>{{ title }}</h3>
        <button class="btn btn-icon btn-ghost" @click="emit('close')">
          <X :size="18" />
        </button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
      <div class="modal-foot">
        <slot name="foot" />
      </div>
    </div>
  </div>
</template>
