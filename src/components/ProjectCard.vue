<script setup>
import { computed } from 'vue'
import { Clock, Users } from 'lucide-vue-next'
import { useUsersStore } from '../store'

const props = defineProps({
  project: { type: Object, required: true }
})
const emit = defineEmits(['click'])
const usersStore = useUsersStore()

const statusMap = {
  active: { text: '进行中', cls: 'tag-green' },
  planning: { text: '规划中', cls: 'tag-orange' },
  completed: { text: '已完成', cls: 'tag-purple' }
}
const status = computed(() => statusMap[props.project.status] || statusMap.planning)

function fmt(d) {
  if (!d) return ''
  const dt = new Date(d)
  return `${dt.getMonth() + 1}月${dt.getDate()}日`
}
const avatars = computed(() => props.project.members.map((id) => usersStore.get(id)).filter(Boolean))
</script>

<template>
  <article class="pcard glass" @click="emit('click', project)">
    <div class="top">
      <span class="ico" :style="{ background: project.color + '1f', color: project.color }">{{ project.icon }}</span>
      <span class="tag" :class="status.cls">{{ status.text }}</span>
    </div>

    <h3 class="name">{{ project.name }}</h3>
    <p class="desc">{{ project.desc }}</p>

    <div class="bar-row">
      <div class="bar">
        <i :style="{ width: project.progress + '%', background: project.color }"></i>
      </div>
      <span class="pct">{{ project.progress }}%</span>
    </div>

    <div class="meta">
      <span class="m-item"><Clock :size="13" /> {{ fmt(project.end) }}</span>
      <span class="stack">
        <Users :size="13" />
        <img
          v-for="(u, i) in avatars.slice(0, 4)"
          :key="u.id"
          :src="u.avatar"
          :alt="u.name"
          :style="{ zIndex: avatars.length - i }"
        />
        <i v-if="avatars.length > 4" class="more">+{{ avatars.length - 4 }}</i>
      </span>
    </div>

    <div class="tags" v-if="project.tags?.length">
      <span v-for="t in project.tags" :key="t" class="tag">{{ t }}</span>
    </div>
  </article>
</template>

<style scoped>
.pcard {
  border-radius: var(--r-lg);
  padding: 18px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s;
}
.pcard:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: rgba(0, 113, 227, 0.3);
}
.top {
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
  font-size: 20px;
}
.name {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.2px;
}
.desc {
  font-size: 13px;
  color: var(--text-2);
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
}
.bar {
  flex: 1;
  height: 6px;
  background: var(--bg-input);
  border-radius: 3px;
  overflow: hidden;
}
.bar i {
  display: block;
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}
.pct {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-2);
  min-width: 34px;
  text-align: right;
}
.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border-glass);
}
.m-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-3);
}
.stack {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--text-3);
}
.stack img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bg-soft);
  border: 2px solid var(--bg);
  margin-left: -9px;
  transition: transform 0.15s;
}
.stack img:first-of-type { margin-left: 0; }
.stack img:hover { transform: scale(1.15); z-index: 9 !important; }
.more {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bg-input);
  font-size: 10px;
  font-style: normal;
  font-weight: 700;
  color: var(--text-2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -9px;
}
.tags {
  display: flex;
  gap: 6px;
  margin-top: 12px;
  flex-wrap: wrap;
}
</style>
