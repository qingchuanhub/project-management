<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/task'
import { useProjectStore } from '@/stores/project'
import { Plus, Search, Filter, MoreVertical, ChevronDown } from 'lucide-vue-next'
import KanbanColumn from '@/components/kanban/KanbanColumn.vue'
import TaskCard from '@/components/kanban/TaskCard.vue'
import { ElMessage } from 'element-plus'

const taskStore = useTaskStore()
const projectStore = useProjectStore()

const searchQuery = ref('')
const showCreateModal = ref(false)
const newTask = ref({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assignee: '',
  tags: [],
  dueDate: ''
})
const draggedTask = ref(null)
const dragOverColumn = ref(null)

const currentProject = computed(() => projectStore.activeProject)
const columns = computed(() => taskStore.columns)
const tasksByColumn = computed(() => taskStore.tasksByColumn)
const taskCounts = computed(() => taskStore.taskCounts)

const filteredTasks = computed(() => {
  if (!searchQuery.value) return tasksByColumn.value
  const query = searchQuery.value.toLowerCase()
  const filtered = {}
  Object.keys(tasksByColumn.value).forEach(col => {
    filtered[col] = tasksByColumn.value[col].filter(task =>
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query)
    )
  })
  return filtered
})

function handleDragStart(task, event) {
  draggedTask.value = task
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', task.id)
  setTimeout(() => {
    event.target.classList.add('dragging')
  }, 0)
}

function handleDragEnd(event) {
  event.target.classList.remove('dragging')
  draggedTask.value = null
  dragOverColumn.value = null
}

function handleDragOver(event, columnId) {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  dragOverColumn.value = columnId
}

function handleDragLeave(event, columnId) {
  const rect = event.currentTarget.getBoundingClientRect()
  if (
    event.clientY < rect.top ||
    event.clientY > rect.bottom ||
    event.clientX < rect.left ||
    event.clientX > rect.right
  ) {
    if (dragOverColumn.value === columnId) {
      dragOverColumn.value = null
    }
  }
}

function handleDrop(event, columnId) {
  event.preventDefault()
  if (draggedTask.value && draggedTask.value.status !== columnId) {
    const columnTasks = filteredTasks.value[columnId] || []
    const rect = event.currentTarget.getBoundingClientRect()
    const y = event.clientY - rect.top
    const taskHeight = 80
    const newOrder = Math.floor(y / taskHeight)
    const clampedOrder = Math.max(0, Math.min(newOrder, columnTasks.length))
    taskStore.moveTask(draggedTask.value.id, columnId, clampedOrder)
  }
  dragOverColumn.value = null
}

function openCreateTask(status = 'todo') {
  newTask.value = {
    title: '',
    description: '',
    status,
    priority: 'medium',
    assignee: '',
    tags: [],
    dueDate: ''
  }
  showCreateModal.value = true
}

function createTask() {
  if (!newTask.value.title.trim()) return
  taskStore.addTask(newTask.value)
  showCreateModal.value = false
  ElMessage.success('任务创建成功')
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const statusColors = {
  todo: '#86868b',
  'in-progress': '#0071e3',
  review: '#ff9f0a',
  done: '#30d158'
}
</script>

<template>
  <div class="kanban-view">
    <!-- Header -->
    <div class="view-header">
      <div>
        <h1>看板</h1>
        <p class="view-subtitle" v-if="currentProject">{{ currentProject.name }} - 任务管理</p>
      </div>
      <div class="header-actions">
        <div class="search-wrapper">
          <Search size="18" class="search-icon" />
          <input
            type="search"
            class="search-input input"
            placeholder="搜索任务..."
            v-model="searchQuery"
          />
        </div>
        <button class="btn btn-primary" @click="openCreateTask">
          <Plus size="16" />
          新建任务
        </button>
      </div>
    </div>

    <!-- Kanban Board -->
    <div class="kanban-board" role="list">
      <KanbanColumn
        v-for="column in columns"
        :key="column.id"
        :column="column"
        :tasks="filteredTasks[column.id]"
        :count="taskCounts[column.id]"
        :is-drag-over="dragOverColumn === column.id"
        @drag-over="handleDragOver"
        @drag-leave="handleDragLeave"
        @drop="handleDrop"
        @add-task="openCreateTask"
      />
    </div>

    <!-- Create Task Modal -->
    <transition name="fade">
      <div class="modal-overlay" v-show="showCreateModal" @click.self="showCreateModal = false">
        <div class="modal glass-strong" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div class="modal-header">
            <h2 id="modal-title">新建任务</h2>
            <button class="btn btn-icon btn-ghost" @click="showCreateModal = false">
              <X size="20" />
            </button>
          </div>
          <form @submit.prevent="createTask" class="modal-body">
            <div class="form-group">
              <label for="task-title">标题 *</label>
              <input
                id="task-title"
                type="text"
                class="input"
                v-model="newTask.title"
                placeholder="输入任务标题"
                required
                autofocus
              />
            </div>
            <div class="form-group">
              <label for="task-description">描述</label>
              <textarea
                id="task-description"
                class="input"
                v-model="newTask.description"
                placeholder="任务详细描述"
                rows="3"
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>优先级</label>
                <select class="input select" v-model="newTask.priority">
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
              <div class="form-group">
                <label>截止日期</label>
                <input type="date" class="input" v-model="newTask.dueDate" />
              </div>
            </div>
            <div class="form-group">
              <label>标签 (逗号分隔)</label>
              <input
                type="text"
                class="input"
                v-model="newTask.tags"
                placeholder="frontend, bug, urgent"
              />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showCreateModal = false">取消</button>
              <button type="submit" class="btn btn-primary">创建任务</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.kanban-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.view-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
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
  gap: 16px;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  width: 280px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-input {
  padding-left: 44px;
}

.kanban-board {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 8px;
  padding-bottom: 24px;
  min-height: 600px;
}

.kanban-board::-webkit-scrollbar {
  height: 8px;
}

.kanban-board::-webkit-scrollbar-track {
  background: transparent;
}

.kanban-board::-webkit-scrollbar-thumb {
  background: var(--text-tertiary);
  border-radius: 4px;
  opacity: 0.5;
}

.kanban-board::-webkit-scrollbar-thumb:hover {
  opacity: 1;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: var(--radius-xl);
  padding: 0;
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--glass-border);
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--glass-border);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1023px) {
  .search-wrapper {
    width: 200px;
  }

  .form-row {
    grid-template-columns: 1fr;
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

  .search-wrapper {
    width: 100%;
  }

  .kanban-board {
    padding: 8px;
  }
}
</style>