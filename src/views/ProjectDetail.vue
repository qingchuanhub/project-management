<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { useUserStore } from '@/stores/user'
import { ArrowLeft, Plus, Users, Clock, CheckCircle, Flag, MessageSquare, MoreVertical, Edit, Trash2, Calendar, User } from 'lucide-vue-next'
import ProjectCard from '@/components/projects/ProjectCard.vue'
import TaskCard from '@/components/kanban/TaskCard.vue'
import StatCard from '@/components/ui/StatCard.vue'
import { ElMessage, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElDatePicker, ElButton, ElTabs, ElTabPane } from 'element-plus'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const userStore = useUserStore()

const project = computed(() => projectStore.projects.find(p => p.id === route.params.id))
const projectTasks = computed(() => taskStore.projectTasks.value)
const projectMembers = computed(() => userStore.projectMembers(project.value?.id))
const activeTab = ref('overview')

const taskStats = computed(() => ({
  total: projectTasks.value.length,
  todo: projectTasks.value.filter(t => t.status === 'todo').length,
  inProgress: projectTasks.value.filter(t => t.status === 'in-progress').length,
  review: projectTasks.value.filter(t => t.status === 'review').length,
  done: projectTasks.value.filter(t => t.status === 'done').length
}))

const recentTasks = computed(() =>
  projectTasks.value
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)
)

const statusColors = {
  todo: '#86868b',
  'in-progress': '#0071e3',
  review: '#ff9f0a',
  done: '#30d158'
}

const statusLabels = {
  todo: '待办',
  'in-progress': '进行中',
  review: '审查中',
  done: '已完成'
}

const priorityLabels = { high: '高', medium: '中', low: '低' }
const priorityColors = { high: '#ff3b30', medium: '#ff9f0a', low: '#30d158' }

function goBack() {
  router.push('/projects')
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

function getStatusColor(status) {
  return statusColors[status] || '#86868b'
}
</script>

<template>
  <div class="project-detail-view" v-if="project">
    <!-- Header -->
    <div class="project-header glass">
      <div class="header-left">
        <button class="btn btn-icon btn-ghost" @click="goBack" aria-label="返回">
          <ArrowLeft size="20" />
        </button>
        <div class="project-identity">
          <div class="project-icon-large" :style="{ background: project.color + '15', color: project.color }">
            <component :is="project.icon" size="28" />
          </div>
          <div>
            <h1>{{ project.name }}</h1>
            <div class="project-badges">
              <span class="badge" :style="{ background: getStatusColor(project.status) + '15', color: getStatusColor(project.status) }">
                {{ statusLabels[project.status] || project.status }}
              </span>
              <span class="badge progress-badge">
                {{ project.progress }}% 完成
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="header-right">
        <div class="project-dates">
          <div class="date-item">
            <Calendar size="14" />
            <span>{{ formatDate(project.startDate) }} - {{ formatDate(project.endDate) }}</span>
          </div>
        </div>
        <button class="btn btn-primary" @click="showTaskDialog = true">
          <Plus size="16" />
          新建任务
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <StatCard label="总任务" :value="taskStats.total" :icon="CheckCircle" color="#0071e3" />
      <StatCard label="待办" :value="taskStats.todo" :icon="Clock" color="#86868b" />
      <StatCard label="进行中" :value="taskStats.inProgress" :icon="Flag" color="#0071e3" />
      <StatCard label="已完成" :value="taskStats.done" :icon="CheckCircle" color="#30d158" />
    </div>

    <!-- Tabs -->
    <div class="tabs glass">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" size="18" />
        {{ tab.label }}
        <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Tab Panels -->
    <div class="tab-content">
      <!-- Overview -->
      <div v-show="activeTab === 'overview'" class="tab-panel">
        <div class="overview-grid">
          <section class="section glass">
            <div class="section-header">
              <h2>最近活动</h2>
            </div>
            <div class="activity-feed">
              <div
                v-for="task in recentTasks"
                :key="task.id"
                class="activity-item"
              >
                <div class="activity-indicator" :style="{ background: getStatusColor(task.status) }" />
                <div class="activity-details">
                  <p><strong>{{ task.title }}</strong> <span class="activity-status" :style="{ color: getStatusColor(task.status) }">({{ statusLabels[task.status] }})</span></p>
                  <span class="activity-time">{{ formatDate(task.updatedAt) }}</span>
                </div>
              </div>
              <div v-if="recentTasks.length === 0" class="empty-state">
                <p>暂无最近活动</p>
              </div>
            </div>
          </section>

          <section class="section glass">
            <div class="section-header">
              <h2>团队成员</h2>
              <button class="btn btn-ghost btn-sm">
                <Plus size="14" />
                添加成员
              </button>
            </div>
            <div class="members-grid">
              <div
                v-for="member in projectMembers"
                :key="member.id"
                class="member-card glass"
              >
                <img :src="member.avatar" :alt="member.name" class="member-avatar" />
                <div class="member-info">
                  <p class="member-name">{{ member.name }}</p>
                  <p class="member-role">{{ member.role }}</p>
                </div>
                <span class="member-status" :class="member.status" />
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Tasks -->
      <div v-show="activeTab === 'tasks'" class="tab-panel">
        <div class="tasks-header">
          <h2>所有任务</h2>
          <button class="btn btn-primary" @click="showTaskDialog = true">
            <Plus size="16" />
            新建任务
          </button>
        </div>
        <div class="tasks-table-wrapper">
          <table class="tasks-table">
            <thead>
              <tr>
                <th>任务</th>
                <th>状态</th>
                <th>优先级</th>
                <th>负责人</th>
                <th>截止日期</th>
                <th>更新时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in projectTasks" :key="task.id" @click="viewTask(task)">
                <td>
                  <div class="task-title-cell">
                    <span class="status-dot" :style="{ background: getStatusColor(task.status) }" />
                    {{ task.title }}
                  </div>
                </td>
                <td>
                  <span class="status-badge" :style="{ background: getStatusColor(task.status) + '15', color: getStatusColor(task.status) }">
                    {{ statusLabels[task.status] }}
                  </span>
                </td>
                <td>
                  <span class="priority-badge" :style="{ background: priorityColors[task.priority] + '15', color: priorityColors[task.priority] }">
                    {{ priorityLabels[task.priority] }}
                  </span>
                </td>
                <td>
                  <div class="assignee-cell" v-if="userStore.getUser(task.assignee)">
                    <img :src="userStore.getUser(task.assignee).avatar" :alt="userStore.getUser(task.assignee).name" class="assignee-avatar" />
                    {{ userStore.getUser(task.assignee).name }}
                  </div>
                </td>
                <td>{{ formatDate(task.dueDate) }}</td>
                <td>{{ formatDate(task.updatedAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Kanban -->
      <div v-show="activeTab === 'kanban'" class="tab-panel">
        <KanbanBoard :project-id="project.id" />
      </div>

      <!-- Gantt -->
      <div v-show="activeTab === 'gantt'" class="tab-panel">
        <GanttChart :project-id="project.id" />
      </div>

      <!-- Members -->
      <div v-show="activeTab === 'members'" class="tab-panel">
        <div class="members-header">
          <h2>项目成员</h2>
          <button class="btn btn-primary">
            <Plus size="16" />
            邀请成员
          </button>
        </div>
        <div class="members-list">
          <div
            v-for="member in projectMembers"
            :key="member.id"
            class="member-row glass"
          >
            <img :src="member.avatar" :alt="member.name" class="member-avatar" />
            <div class="member-info">
              <p class="member-name">{{ member.name }}</p>
              <p class="member-email">{{ member.email }}</p>
            </div>
            <span class="member-role-badge">{{ member.role }}</span>
            <span class="member-status" :class="member.status" />
            <div class="member-actions">
              <button class="btn btn-icon btn-ghost"><Edit size="16" /></button>
              <button class="btn btn-icon btn-ghost danger"><Trash2 size="16" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Dialog -->
    <el-dialog
      v-model="showTaskDialog"
      title="新建任务"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="newTask" ref="taskForm" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="newTask.title" placeholder="输入任务标题" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="newTask.description" type="textarea" placeholder="任务描述" :rows="3" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="newTask.status" placeholder="选择状态">
            <el-option label="待办" value="todo" />
            <el-option label="进行中" value="in-progress" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="newTask.priority" placeholder="选择优先级">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="assignee">
          <el-select v-model="newTask.assignee" placeholder="选择负责人">
            <el-option
              v-for="member in projectMembers"
              :key="member.id"
              :label="member.name"
              :value="member.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期" prop="dueDate">
          <el-date-picker v-model="newTask.dueDate" type="date" placeholder="选择日期" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTaskDialog = false">取消</el-button>
        <el-button type="primary" @click="createTask">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.project-detail-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.project-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-radius: var(--radius-xl);
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.project-identity {
  display: flex;
  align-items: center;
  gap: 16px;
}

.project-icon-large {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-identity h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.project-badges {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.badge {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 20px;
}

.progress-badge {
  background: var(--accent-blue) !important;
  color: white !important;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.project-dates .date-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  gap: 4px;
  padding: 6px;
  border-radius: var(--radius-xl);
  margin-bottom: 20px;
  overflow-x: auto;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.tab:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--text-primary);
}

.tab.active {
  background: var(--bg-secondary);
  color: var(--accent-blue);
  box-shadow: var(--shadow-sm);
}

.tab-count {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
}

.tab-content {
  flex: 1;
  overflow-y: auto;
}

.tab-panel {
  display: none;
}

.tab-panel:not([style*="display: none"]) {
  display: block;
  animation: fadeIn 0.3s ease-out;
}

.overview-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.activity-item:hover {
  background: rgba(0, 0, 0, 0.02);
}

.activity-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.activity-details p {
  font-size: 13px;
  color: var(--text-primary);
  margin: 0 0 4px;
}

.activity-status {
  font-weight: 400;
  font-size: 12px;
}

.activity-time {
  font-size: 11px;
  color: var(--text-tertiary);
}

.members-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.member-role {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0;
}

.member-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.member-status.online { background: #30d158; }
.member-status.away { background: #ff9f0a; }
.member-status.busy { background: #ff3b30; }
.member-status.offline { background: #86868b; }

.tasks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tasks-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.tasks-table-wrapper {
  overflow-x: auto;
}

.tasks-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.tasks-table th,
.tasks-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--glass-border);
}

.tasks-table th {
  font-weight: 600;
  color: var(--text-tertiary);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--bg-tertiary);
}

.tasks-table tbody tr {
  cursor: pointer;
  transition: background var(--transition-fast);
}

.tasks-table tbody tr:hover {
  background: rgba(0, 0, 0, 0.02);
}

.task-title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-badge,
.priority-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
}

.assignee-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.assignee-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.member-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: var(--radius-md);
}

.member-row .member-avatar {
  width: 44px;
  height: 44px;
}

.member-row .member-info {
  flex: 1;
}

.member-row .member-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 2px;
}

.member-row .member-email {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0;
}

.member-role-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 20px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.member-actions {
  display: flex;
  gap: 4px;
}

.danger {
  color: var(--accent-red) !important;
}

.danger:hover {
  background: rgba(255, 59, 48, 0.1) !important;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-tertiary);
}

@media (max-width: 1023px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .project-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .tasks-table th:nth-child(3),
  .tasks-table td:nth-child(3),
  .tasks-table th:nth-child(6),
  .tasks-table td:nth-child(6) {
    display: none;
  }
}
</style>