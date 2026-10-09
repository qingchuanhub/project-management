<script setup>
import { ref, computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { useUserStore } from '@/stores/user'
import { TrendingUp, TrendingDown, Activity, Target, Clock, CheckCircle, Flag, Users } from 'lucide-vue-next'
import StatCard from '@/components/ui/StatCard.vue'

const projectStore = useProjectStore()
const taskStore = useTaskStore()
const userStore = useUserStore()

const timeRange = ref('month')
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

const stats = computed(() => {
  const tasks = filteredTasks.value
  const total = tasks.length
  const completed = tasks.filter(t => t.status === 'done').length
  const inProgress = tasks.filter(t => t.status === 'in-progress').length
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
  return { total, completed, inProgress, overdue, completionRate }
})

const tasksByStatus = computed(() => {
  const counts = {}
  taskStore.columns.value.forEach(col => {
    counts[col.id] = filteredTasks.value.filter(t => t.status === col.id).length
  })
  return counts
})

const tasksByPriority = computed(() => {
  const priorities = ['high', 'medium', 'low']
  const counts = {}
  priorities.forEach(p => {
    counts[p] = filteredTasks.value.filter(t => t.priority === p).length
  })
  return counts
})

const tasksByAssignee = computed(() => {
  const assigneeCounts = {}
  filteredTasks.value.forEach(task => {
    if (task.assignee) {
      assigneeCounts[task.assignee] = (assigneeCounts[task.assignee] || 0) + 1
    }
  })
  return Object.entries(assigneeCounts)
    .map(([id, count]) => ({ user: userStore.getUser(id), count }))
    .filter(item => item.user)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const weeklyProgress = computed(() => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return days.map((day, i) => ({
    day,
    completed: Math.floor(Math.random() * 5) + 1,
    created: Math.floor(Math.random() * 3) + 1
  }))
})

const projectProgress = computed(() => {
  return projects.value
    .filter(p => p.status === 'active')
    .map(p => ({
      name: p.name,
      progress: p.progress,
      color: p.color
    }))
})
</script>

<template>
  <div class="stats-view">
    <div class="view-header">
      <div>
        <h1>统计</h1>
        <p class="view-subtitle">项目进度与团队绩效概览</p>
      </div>
      <div class="header-actions">
        <select class="input select" v-model="timeRange" style="width: auto;">
          <option value="week">本周</option>
          <option value="month">本月</option>
          <option value="quarter">本季度</option>
          <option value="year">今年</option>
        </select>
        <select class="input select" v-model="selectedProjectId" style="width: auto; min-width: 200px;">
          <option value="">所有项目</option>
          <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="stats-grid">
      <StatCard label="总任务数" :value="stats.total" :icon="Target" color="#0071e3" />
      <StatCard label="已完成" :value="stats.completed" :icon="CheckCircle" color="#30d158" trend="+12%" />
      <StatCard label="进行中" :value="stats.inProgress" :icon="Flag" color="#ff9f0a" />
      <StatCard label="逾期" :value="stats.overdue" :icon="Clock" color="#ff3b30" :trend="stats.overdue > 0 ? '需关注' : '良好'" />
      <StatCard label="完成率" :value="stats.completionRate + '%'" :icon="TrendingUp" color="#bf5af2" />
      <StatCard label="活跃项目" :value="projectStore.activeProjects.length" :icon="Activity" color="#00c7be" />
    </div>

    <!-- Charts Row -->
    <div class="charts-grid">
      <section class="chart-card glass">
        <div class="chart-header">
          <h2>任务状态分布</h2>
        </div>
        <div class="chart-content">
          <div class="donut-chart">
            <svg viewBox="0 0 200 200" class="donut-svg">
              <circle cx="100" cy="100" r="80" fill="none" stroke="var(--bg-tertiary)" stroke-width="20" />
              <circle
                v-for="(count, status) in tasksByStatus"
                :key="status"
                cx="100" cy="100" r="80"
                fill="none"
                :stroke="statusColors[status]"
                stroke-width="20"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="getOffset(status)"
                stroke-linecap="round"
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div class="donut-center">
              <span class="donut-total">{{ filteredTasks.length }}</span>
              <span class="donut-label">总任务</span>
            </div>
          </div>
          <div class="chart-legend">
            <div
              v-for="col in taskStore.columns"
              :key="col.id"
              class="legend-item"
            >
              <span class="legend-color" :style="{ background: col.color }" />
              <span class="legend-label">{{ col.title }}</span>
              <span class="legend-value">{{ tasksByStatus[col.id] || 0 }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="chart-card glass">
        <div class="chart-header">
          <h2>优先级分布</h2>
        </div>
        <div class="chart-content">
          <div class="bar-chart">
            <div
              v-for="priority in ['high', 'medium', 'low']"
              :key="priority"
              class="bar-item"
            >
              <div class="bar-label">
                <span class="priority-dot" :style="{ background: priorityColors[priority] }" />
                <span>{{ priorityLabels[priority] }}</span>
              </div>
              <div class="bar-wrapper">
                <div
                  class="bar"
                  :style="{
                    width: stats.total > 0 ? (tasksByPriority[priority] / stats.total * 100) + '%' : '0%',
                    background: priorityColors[priority]
                  }"
                />
                <span class="bar-value">{{ tasksByPriority[priority] }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Second Row -->
    <div class="charts-grid">
      <section class="chart-card glass">
        <div class="chart-header">
          <h2>每周完成趋势</h2>
        </div>
        <div class="chart-content">
          <div class="line-chart">
            <div class="chart-bars">
              <div
                v-for="week in weeklyProgress"
                :key="week.day"
                class="week-bar-group"
              >
                <div class="bar completed" :style="{ height: (week.completed / 8 * 100) + '%' }" :title="week.completed + ' 完成'" />
                <div class="bar created" :style="{ height: (week.created / 8 * 100) + '%' }" :title="week.created + ' 新建'" />
              </div>
            </div>
            <div class="chart-x-axis">
              <span v-for="week in weeklyProgress" :key="week.day">{{ week.day }}</span>
            </div>
          </div>
          <div class="chart-legend small">
            <div class="legend-item"><span class="legend-color" style="background: #30d158" /> 已完成</div>
            <div class="legend-item"><span class="legend-color" style="background: #0071e3" /> 新建</div>
          </div>
        </div>
      </section>

      <section class="chart-card glass">
        <div class="chart-header">
          <h2>项目进度</h2>
        </div>
        <div class="chart-content">
          <div class="project-progress-list">
            <div
              v-for="proj in projectProgress"
              :key="proj.name"
              class="project-progress-item"
            >
              <div class="proj-info">
                <span class="proj-name">{{ proj.name }}</span>
                <span class="proj-percent">{{ proj.progress }}%</span>
              </div>
              <div class="proj-bar">
                <div class="proj-fill" :style="{ width: proj.progress + '%', background: proj.color }" />
              </div>
            </div>
            <div v-if="projectProgress.length === 0" class="empty-state">
              暂无活跃项目
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Top Contributors -->
    <section class="chart-card glass">
      <div class="chart-header">
        <h2>贡献榜</h2>
      </div>
      <div class="chart-content">
        <div class="contributors-list">
          <div
            v-for="(item, index) in tasksByAssignee"
            :key="item.user.id"
            class="contributor-item"
          >
            <span class="rank">{{ index + 1 }}</span>
            <img :src="item.user.avatar" :alt="item.user.name" class="contributor-avatar" />
            <div class="contributor-info">
              <span class="contributor-name">{{ item.user.name }}</span>
              <span class="contributor-role">{{ item.user.role }}</span>
            </div>
            <span class="contributor-count">{{ item.count }} 任务</span>
          </div>
          <div v-if="tasksByAssignee.length === 0" class="empty-state">暂无数据</div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.stats-view {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  border-radius: var(--radius-xl);
  padding: 24px;
}

.chart-header {
  margin-bottom: 20px;
}

.chart-header h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.chart-content {
  display: flex;
  align-items: center;
  gap: 32px;
}

.donut-chart {
  position: relative;
  width: 160px;
  height: 160px;
  flex-shrink: 0;
}

.donut-svg {
  width: 100%;
  height: 100%;
}

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.donut-total {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.donut-label {
  font-size: 12px;
  color: var(--text-tertiary);
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-label {
  flex: 1;
  color: var(--text-secondary);
}

.legend-value {
  font-weight: 600;
  color: var(--text-primary);
}

.bar-chart {
  width: 100%;
}

.bar-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bar-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.priority-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.bar-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 24px;
}

.bar {
  height: 100%;
  border-radius: var(--radius-sm);
  transition: width 0.5s ease-out;
  min-width: 20px;
}

.bar-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 30px;
}

.line-chart {
  width: 100%;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 160px;
  gap: 8px;
  padding-bottom: 8px;
}

.week-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  height: 100%;
  justify-content: flex-end;
}

.bar {
  width: 100%;
  max-width: 32px;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease-out;
}

.bar.completed { background: #30d158; }
.bar.created { background: #0071e3; opacity: 0.6; }

.chart-x-axis {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 11px;
  color: var(--text-tertiary);
}

.chart-legend.small {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--glass-border);
}

.project-progress-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-progress-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.proj-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.proj-name { color: var(--text-primary); }
.proj-percent { color: var(--text-secondary); font-weight: 600; }

.proj-bar {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.proj-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease-out;
}

.contributors-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contributor-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.contributor-item:hover {
  background: rgba(0, 0, 0, 0.02);
}

.rank {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.contributor-item:nth-child(1) .rank { background: #ffd700; color: #1d1d1f; }
.contributor-item:nth-child(2) .rank { background: #c0c0c0; color: #1d1d1f; }
.contributor-item:nth-child(3) .rank { background: #cd7f32; color: white; }

.contributor-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.contributor-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contributor-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.contributor-role {
  font-size: 11px;
  color: var(--text-tertiary);
}

.contributor-count {
  margin-left: auto;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-blue);
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-tertiary);
}

@media (max-width: 1023px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-content {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  .donut-chart {
    margin: 0 auto;
  }
}

@media (max-width: 640px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>