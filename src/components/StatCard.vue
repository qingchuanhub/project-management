<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: Object, required: true },
  color: { type: String, default: '#0071e3' },
  trend: { type: String, default: '' }
})
</script>

<template>
  <div class="stat glass">
    <div class="row">
      <span class="ico" :style="{ background: color + '1f', color }">
        <component :is="icon" :size="20" />
      </span>
      <span v-if="trend" class="trend">{{ trend }}</span>
    </div>
    <div class="num">{{ value }}</div>
    <div class="lab">{{ label }}</div>
  </div>
</template>

<style scoped>
.stat {
  border-radius: var(--r-lg);
  padding: 18px 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.stat:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.ico {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.trend {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
  background: rgba(48, 209, 88, 0.15);
  color: #248a3d;
}
.dark .trend { color: var(--green); }
.num {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1.1;
}
.lab {
  font-size: 13px;
  color: var(--text-2);
  margin-top: 3px;
}
</style>
