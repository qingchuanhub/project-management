<script setup>
import { computed } from 'vue'
import { Clock, AlertTriangle } from 'lucide-vue-next'
import { useUsersStore } from '../store'

const props = defineProps({
  task: { type: Object, required: true },
  showProject: { type: Boolean, default: false }
})
const emit = defineEmits(['dragstart', 'dragend', 'click'])
const usersStore = useUsersStore()

const priMap = {
  high: { text: '高', color: '#ff453a' },
  medium: { text: '中', color: '#ff9f0a' },
  low: { text: '低', color: '#30d158' }
}
const pri = computed(() => priMap[props.task.priority] || priMap.medium)
const user = computed(() => usersStore.get(props.task.assignee))
const overdue = computed(() => {
  if (!props.task.due || props.task.col === 'done') return false
  return new Date(props.task.due) < new Date(new Date().toDateString())
})

function fmt(d) {
  if (!d) return ''
  const dt = new Date(d)
  return `${dt.getMonth() + 1}/${dt.getDate()}`
}

function onDragStart(e) {
  e.dataTransfer.setData('text/plain', props.task.id)
  e.dataTransfer.effectAllowed = 'move'
  emit('dragstart', props.task)
}
</script>

<template>
  <article
    class="tcard glass"
    :class="{ over: overdue }"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="emit('dragend', task)"
    @click="emit('click', task)"
  >
    <div class="row">
      <span class="pri" :style="{ background: pri.color + '22', color: pri.color }">{{ pri.text }}</span>
    </div>

    <h4 class="title">{{ task.title }}</h4>
    <p v-if="task.desc" class="desc">{{ task.desc }}</p>

    <div class="foot">
      <span v-if="task.due" class="due" :class="{ late: overdue }">
        <Clock :size="12" />
        {{ fmt(task.due) }}
        <AlertTriangle v-if="overdue" :size="12" />
      </span>
      <span class="tags" v-if="task.tags?.length">
        <i v-for="t in task.tags.slice(0, 2)" :key="t" class="tag">{{ t }}</i>
      </span>
      <img v-if="user" :src="user.avatar" :alt="user.name" class="ava" :title="user.name" />
    </div>
  </article>
</template>

<style scoped>
.tcard {
  border-radius: var(--r-md);
  padding: 14px;
  cursor: grab;
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s;
  user-select: none;
}
.tcard:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: rgba(0, 113, 227, 0.35);
}
.tcard:active { cursor: grabbing; }
.tcard.over { border-color: rgba(255, 69, 58, 0.4); }
.row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}
.pri {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 5px;
}
.title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}
.desc {
  font-size: 12px;
  color: var(--text-2);
  margin-top: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.foot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--border-glass);
}
.due {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-3);
}
.due.late { color: var(--red); font-weight: 600; }
.tags {
  display: inline-flex;
  gap: 4px;
}
.ava {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--bg-soft);
  margin-left: auto;
}
</style>
