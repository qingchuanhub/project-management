<script setup>
import { ref, computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useRouter } from 'vue-router'
import { Plus, Search, Grid, List, Filter, MoreVertical } from 'lucide-vue-next'
import ProjectCard from '@/components/projects/ProjectCard.vue'

const projectStore = useProjectStore()
const router = useRouter()

const viewMode = ref('grid')
const searchQuery = ref('')
const statusFilter = ref('all')
const showCreateModal = ref(false)

const newProject = ref({
  name: '',
  description: '',
  status: 'planning',
  startDate: '',
  endDate: '',
  color: '#0071e3',
  icon: 'rocket'
})

const filteredProjects = computed(() => {
  let projects = projectStore.projects
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    projects = projects.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    )
  }
  if (statusFilter.value !== 'all') {
    projects = projects.filter(p => p.status === statusFilter.value)
  }
  return projects
})

const statusOptions = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '进行中' },
  { value: 'planning', label: '规划中' },
  { value: 'completed', label: '已完成' }
]

function navigateToProject(project) {
  router.push(`/projects/${project.id}`)
}

function openCreateModal() {
  newProject.value = {
    name: '',
    description: '',
    status: 'planning',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    color: '#0071e3',
    icon: 'rocket'
  }
  showCreateModal.value = true
}

function createProject() {
  if (!newProject.value.name.trim()) return
  projectStore.addProject(newProject.value)
  showCreateModal.value = false
}

const icons = ['rocket', 'smartphone', 'server', 'palette', 'database', 'globe', 'shield', 'zap']
const colors = ['#0071e3', '#30d158', '#ff9f0a', '#bf5af2', '#ff2d55', '#5e5ce6', '#00c7be', '#ff375f']
</script>

<template>
  <div class="projects-view">
    <!-- Header -->
    <div class="view-header">
      <div>
        <h1>项目</h1>
        <p class="view-subtitle">管理所有项目，跟踪进度与协作</p>
      </div>
      <div class="header-actions">
        <div class="search-wrapper">
          <Search size="18" class="search-icon" />
          <input
            type="search"
            class="search-input input"
            placeholder="搜索项目..."
            v-model="searchQuery"
          />
        </div>
        <div class="view-toggle" role="group" aria-label="视图模式">
          <button
            class="btn btn-icon"
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
            aria-label="网格视图"
          >
            <Grid size="18" />
          </button>
          <button
            class="btn btn-icon"
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
            aria-label="列表视图"
          >
            <List size="18" />
          </button>
        </div>
        <select class="input select" v-model="statusFilter" style="width: auto; min-width: 140px;">
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <button class="btn btn-primary" @click="openCreateModal">
          <Plus size="16" />
          新建项目
        </button>
      </div>
    </div>

    <!-- Projects Grid/List -->
    <div class="projects-container" :class="viewMode">
      <ProjectCard
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
        @click="navigateToProject"
      />

      <div class="project-card add-project" @click="openCreateModal">
        <div class="add-icon">
          <Plus size="24" />
        </div>
        <h3>新建项目</h3>
        <p>创建新的项目开始协作</p>
      </div>
    </div>

    <!-- Create Project Modal -->
    <transition name="fade">
      <div class="modal-overlay" v-show="showCreateModal" @click.self="showCreateModal = false">
        <div class="modal glass-strong" role="dialog" aria-modal="true" aria-labelledby="create-project-title">
          <div class="modal-header">
            <h2 id="create-project-title">新建项目</h2>
            <button class="btn btn-icon btn-ghost" @click="showCreateModal = false">
              <X size="20" />
            </button>
          </div>
          <form @submit.prevent="createProject" class="modal-body">
            <div class="form-group">
              <label for="project-name">项目名称 *</label>
              <input
                id="project-name"
                type="text"
                class="input"
                v-model="newProject.name"
                placeholder="输入项目名称"
                required
                autofocus
              />
            </div>
            <div class="form-group">
              <label for="project-description">描述</label>
              <textarea
                id="project-description"
                class="input"
                v-model="newProject.description"
                placeholder="项目描述"
                rows="3"
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>状态</label>
                <select class="input select" v-model="newProject.status">
                  <option value="planning">规划中</option>
                  <option value="active">进行中</option>
                </select>
              </div>
              <div class="form-group">
                <label>开始日期</label>
                <input type="date" class="input" v-model="newProject.startDate" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>预计结束日期</label>
                <input type="date" class="input" v-model="newProject.endDate" />
              </div>
              <div class="form-group">
                <label>项目颜色</label>
                <div class="color-picker">
                  <input
                    type="color"
                    v-model="newProject.color"
                    class="color-input"
                    @input="$event.target.value = $event.target.value.toUpperCase()"
                  />
                  <span class="color-value">{{ newProject.color }}</span>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>图标</label>
              <div class="icon-picker">
                <button
                  v-for="icon in icons"
                  :key="icon"
                  type="button"
                  class="icon-option"
                  :class="{ active: newProject.icon === icon }"
                  @click="newProject.icon = icon"
                >
                  <component :is="icon" size="20" />
                </button>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showCreateModal = false">取消</button>
              <button type="submit" class="btn btn-primary">创建项目</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.projects-view {
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
  gap: 12px;
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

.view-toggle {
  display: flex;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 4px;
  border: 1px solid var(--glass-border);
}

.view-toggle .btn {
  color: var(--text-tertiary);
}

.view-toggle .btn.active {
  background: var(--bg-secondary);
  color: var(--accent-blue);
  box-shadow: var(--shadow-sm);
}

.projects-container {
  flex: 1;
  overflow-y: auto;
}

.projects-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.projects-container.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.projects-container.list .project-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
}

.projects-container.list .project-header {
  margin-bottom: 0;
}

.projects-container.list .project-body {
  display: flex;
  align-items: center;
  gap: 16px;
}

.projects-container.list .project-description {
  margin: 0;
  max-width: 300px;
}

.projects-container.list .project-progress {
  width: 200px;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.projects-container.list .progress-bar {
  width: 100%;
  max-width: 150px;
}

.projects-container.list .project-meta {
  display: flex;
  gap: 24px;
  border-top: none;
  padding-top: 0;
}

.projects-container.list .project-footer {
  display: none;
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
  max-width: 560px;
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

.color-picker {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-input {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  padding: 0;
}

.color-value {
  font-size: 13px;
  font-family: monospace;
  color: var(--text-secondary);
}

.icon-picker {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.icon-option {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  border: 2px solid var(--glass-border);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.icon-option:hover {
  border-color: var(--accent-blue);
  color: var(--accent-blue);
}

.icon-option.active {
  border-color: var(--accent-blue);
  background: rgba(0, 113, 227, 0.1);
  color: var(--accent-blue);
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

  .projects-container.grid {
    grid-template-columns: 1fr;
  }

  .projects-container.list .project-card {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .projects-container.list .project-body {
    flex-direction: column;
    align-items: flex-start;
  }

  .projects-container.list .project-description {
    max-width: none;
  }

  .projects-container.list .project-progress {
    width: 100%;
  }

  .projects-container.list .project-meta {
    flex-wrap: wrap;
  }
}
</style>