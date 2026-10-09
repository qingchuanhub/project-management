<script setup>
import { ref, computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { Calendar, ChevronLeft, ChevronRight, Clock, Search, Filter } from 'lucide-vue-next'

const projectStore = useProjectStore()
const taskStore = useTaskStore()

const currentDate = ref(new Date())
const viewMode = ref('month')
const selectedProjectId = ref('')

const projects = computed(() => projectStore.projects)
const allTasks = computed(() => taskStore.tasks)

const filteredTasks = computed(() => {
  let tasks = allTasks.value
  if (selectedProjectId.value) {
    tasks = tasks.filter(t => t.projectId === selectedProjectId.value)
  }
  return tasks
})

const ganttData = computed(() => {
  const data = []
  filteredTasks.value.forEach(task => {
    const project = projects.value.find(p => p.id === task.projectId)
    if (task.dueDate) {
      data.push({
        id: task.id,
        name: task.title,
        project: project?.name || '',
        start: task.createdAt,
        end: task.dueDate,
        progress: task.status === 'done' ? 100 : task.status === 'in-progress' ? 50 : 0,
        status: task.status,
        assignee: task.assignee
      })
    }
  })
  return data
})

function prevPeriod() {
  const date = new Date(currentDate.value)
  if (viewMode.value === 'month') date.setMonth(date.getMonth() - 1)
  else if (viewMode.value === 'week') date.setDate(date.getDate() - 7)
  else date.setDate(date.getDate() - 1)
  currentDate.value = date
}

function nextPeriod() {
  const date = new Date(currentDate.value)
  if (viewMode.value === 'month') date.setMonth(date.getMonth() + 1)
  else if (viewMode.value === 'week') date.setDate(date.getDate() + 7)
  else date.setDate(date.getDate() + 1)
  currentDate.value = date
}

function goToday() {
  currentDate.value = new Date()
}

function formatPeriod() {
  const date = currentDate.value
  if (viewMode.value === 'month') {
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
  } else if (viewMode.value === 'week') {
    const start = new Date(date)
    start.setDate(date.getDate() - date.getDay())
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return `${start.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'long' })
}
</script>

<template>
  <div class="gantt-view">
    <div class="view-header">
      <div>
        <h1>甘特图</h1>
        <p class="view-subtitle">项目时间线与进度可视化</p>
      </div>
      <div class="header-actions">
        <select class="input select" v-model="selectedProjectId" style="width: auto; min-width: 200px;">
          <option value="">所有项目</option>
          <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <div class="view-toggle" role="group">
          <button class="btn btn-icon" :class="{ active: viewMode === 'month' }" @click="viewMode = 'month'">月</button>
          <button class="btn btn-icon" :class="{ active: viewMode === 'week' }" @click="viewMode = 'week'">周</button>
          <button class="btn btn-icon" :class="{ active: viewMode === 'day' }" @click="viewMode = 'day'">日</button>
        </div>
        <div class="period-nav">
          <button class="btn btn-icon btn-ghost" @click="prevPeriod"><ChevronLeft size="18" /></button>
          <span class="period-label">{{ formatPeriod() }}</span>
          <button class="btn btn-icon btn-ghost" @click="nextPeriod"><ChevronRight size="18" /></button>
          <button class="btn btn-ghost btn-sm" @click="goToday"><Clock size="16" /> 今天</button>
        </div>
      </div>
    </div>

    <div class="gantt-container glass">
      <div class="gantt-header">
        <div class="gantt-col task-col">任务</div>
        <div class="gantt-col project-col">项目</div>
        <div class="gantt-col timeline-col">时间线</div>
      </div>
      <div class="gantt-body">
        <div v-for="task in ganttData" :key="task.id" class="gantt-row">
          <div class="gantt-col task-col">
            <div class="task-info">
              <span class="status-dot" :style="{ background: statusColors[task.status] }" />
              <span>{{ task.name }}</span>
            </div>
          </div>
          <div class="gantt-col project-col">{{ task.project }}</div>
          <div class="gantt-col timeline-col">
            <div class="timeline-bar" :style="getBarStyle(task)">
              <div class="progress-fill" :style="{ width: task.progress + '%' }" />
            </div>
          </div>
        </div>
        <div v-if="ganttData.length === 0" class="empty-gantt">
          <Calendar size="48" />
          <p>暂无任务数据</p>
          <p class="hint">创建带有截止日期的任务以查看甘特图</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gantt-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.view-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.view-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 4px 0 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.period-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.period-label {
  min-width: 180px;
  text-align: center;
  font-weight: 500;
  color: var(--text-primary);
}

.gantt-container {
  flex: 1;
  border-radius: var(--radius-xl);
  overflow: hidden;
  min-height: 600px;
}

.gantt-header {
  display: grid;
  grid-template-columns: 280px 180px 1fr;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--glass-border);
  font-weight: 600;
  font-size: 13px;
  color: var(--text-secondary);
}

.gantt-body {
  overflow-y: auto;
  max-height: calc(100vh - 280px);
}

.gantt-row {
  display: grid;
  grid-template-columns: 280px 180px 1fr;
  padding: 12px 16px;
  border-bottom: 1px solid var(--glass-border);
  align-items: center;
  gap: 16px;
  transition: background var(--transition-fast);
}

.gantt-row:hover {
  background: rgba(0, 0, 0, 0.02);
}

.task-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.timeline-bar {
  height: 28px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  position: relative;
  overflow: hidden;
  min-width: 300px;
}

.progress-fill {
  height: 100%;
  background: var(--accent-blue);
  border-radius: var(--radius-sm);
  transition: width 0.3s ease-out;
}

.empty-gantt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-tertiary);
  text-align: center;
  gap: 12px;
}

.empty-gantt .hint {
  font-size: 13px;
}

.status-colors {
  --todo: #86868b;
  --in-progress: #0071e3;
  --review: #ff9f0a;
  --done: #30d158;
}

@media (max-width: 1023px) {
  .gantt-header,
  .gantt-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .gantt-header .project-col,
  .gantt-row .project-col {
    display: none;
  }

  .timeline-bar {
    min-width: 100%;
  }
}
</style>