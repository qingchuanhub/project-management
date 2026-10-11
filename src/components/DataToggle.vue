<script setup>
import { ref, computed, watch } from 'vue'
import { DATA_MODES, getDataByMode } from '../break-data'

const props = defineProps({
  mode: { type: String, default: 'demo' }
})

const emit = defineEmits(['update:mode'])

const localMode = ref(props.mode)

watch(() => props.mode, (v) => localMode.value = v)
watch(localMode, (v) => emit('update:mode', v))

const modeLabels = {
  demo: '演示数据',
  worst: '最坏情况',
  empty: '空数据',
  one: '单条数据',
  thousand: '千条数据'
}
</script>

<template>
  <div class="data-toggle" v-if="isDev">
    <span class="toggle-label">数据源:</span>
    <div class="toggle-segmented" role="group" aria-label="数据源切换">
      <button
        v-for="mode in DATA_MODES"
        :key="mode"
        :class="{ active: localMode === mode }"
        @click="localMode = mode"
        class="toggle-btn"
        :aria-pressed="localMode === mode"
      >
        {{ modeLabels[mode] }}
      </button>
    </div>
    <span class="mode-hint" v-if="localMode !== 'demo'">🔧 开发模式: {{ modeLabels[localMode] }}</span>
  </div>
</template>

<style scoped>
.data-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: var(--bg-input);
  border-radius: 100px;
  border: 1px solid var(--border);
  font-size: 12px;
  color: var(--text-2);
  white-space: nowrap;
}

.toggle-label {
  font-weight: 500;
  color: var(--text-3);
}

.toggle-segmented {
  display: inline-flex;
  background: var(--bg-solid);
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
}

.toggle-btn {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 500;
  border: none;
  background: transparent;
  color: var(--text-2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.toggle-btn:hover {
  color: var(--text);
  background: var(--bg-input);
}

.toggle-btn.active {
  background: var(--blue);
  color: white;
  box-shadow: 0 2px 6px rgba(0, 113, 227, 0.3);
}

.mode-hint {
  font-size: 10px;
  color: var(--orange);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>