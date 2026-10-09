<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], required: true },
  icon: { type: Object, required: true },
  color: { type: String, default: '#0071e3' },
  trend: { type: String, default: '' }
})

const iconStyle = computed(() => ({
  background: `${props.color}15`,
  color: props.color
}))
</script>

<template>
  <div class="stat-card glass">
    <div class="stat-header">
      <div class="stat-icon" :style="iconStyle">
        <component :is="icon" size="22" />
      </div>
      <span v-if="trend" class="stat-trend">{{ trend }}</span>
    </div>
    <div class="stat-body">
      <p class="stat-value">{{ value }}</p>
      <p class="stat-label">{{ label }}</p>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  border-radius: var(--radius-xl);
  padding: 20px 24px;
  transition: all var(--transition-base);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-trend {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(48, 209, 88, 0.1);
  color: #30d158;
  white-space: nowrap;
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}
</style>