<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import {
  FolderKanban, CheckCircle, Clock, AlertTriangle,
  TrendingUp, Users, Activity, Plus, ArrowRight
} from 'lucide-vue-next'
import ProjectCard from '@/components/projects/ProjectCard.vue'
import TaskCard from '@/components/kanban/TaskCard.vue'
import StatCard from '@/components/ui/StatCard.vue'

const projectStore = useProjectStore()
const taskStore = useTaskStore()
const userStore = useUserStore()
const router = useRouter()

const stats = computed(() => [
  { label: '进行中项目', value: projectStore.activeProjects.length, icon: FolderKanban, color: '#0071e3', trend: '+2 本月' },
  { label: '待办任务', value: taskStore.taskCounts['todo'] || 0, icon: Clock, color: '#ff9f0a', trend: '需关注' },
  { label: '进行中任务', value: taskStore.taskCounts['in-progress'] || 0, icon: Activity, color: '#bf5af2', trend: '进行中' },
  { label: '本周完成', value: 12, icon: CheckCircle, color: '#30d158', trend: '+23%' }
])

const recentProjects = computed(() =>
  projectStore.activeProjects.slice(0, 4)
)

const urgentTasks = computed(() =>
  taskStore.projectTasks.value
    .filter(t => t.status !== 'done' && t.priority === 'high')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)
)

const teamActivity = ref([
  { user: 'Sarah', action: '完成了任务', target: 'API 文档编写', time: '10分钟前', color: '#30d158' },
  { user: 'Mike', action: '评论了', target: '认证流程实现', time: '30分钟前', color: '#0071e3' },
  { user: 'Emily', action: '创建了任务', target: '移动端适配', time: '2小时前', color: '#bf5af2' },
  { user: 'Alex', action: '更新了项目', target: 'Project Alpha', time: '4小时前', color: '#ff9f0a' }
])

function navigateTo(path) {
  router.push(path)
}

function createProject() {
  router.push('/projects')
}

function viewAllTasks() {
  router.push('/kanban')
}
</script>

<template>
  <div class="dashboard">
    <!-- Stats Grid -->
    <div class="stats-grid">
      <StatCard
        v-for="stat in stats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :icon="stat.icon"
        :color="stat.color"
        :trend="stat.trend"
      />
    </div>

    <div class="dashboard-grid">
      <!-- Projects Section -->
      <section class="section glass">
        <div class="section-header">
          <h2>我的项目</h2>
          <div class="section-actions">
            <router-link to="/projects" class="btn btn-ghost btn-sm">
              查看全部
              <ArrowRight size="14" />
            </router-link>
            <button class="btn btn-primary btn-sm" @click="createProject">
              <Plus size="14" />
              新建项目
            </button>
          </div>
        </div>
        <div class="projects-grid">
          <ProjectCard
            v-for="project in recentProjects"
            :key="project.id"
            :project="project"
            @click="navigateTo(`/projects/${project.id}`)"
          />
          <div class="project-card add-project" @click="createProject">
            <div class="add-icon">
              <Plus size="24" />
            </div>
            <h3>新建项目</h3>
            <p>创建新的项目开始协作</p>
          </div>
        </div>
      </section>

      <!-- Urgent Tasks Section -->
      <section class="section glass">
        <div class="section-header">
          <h2>紧急任务</h2>
          <router-link to="/kanban" class="btn btn-ghost btn-sm" @click="viewAllTasks">
            查看看板
            <ArrowRight size="14" />
          </router-link>
        </div>
        <div class="task-list">
          <TaskCard
            v-for="task in urgentTasks"
            :key="task.id"
            :task="task"
            :showProject="true"
            compact
          />
          <div v-if="urgentTasks.length === 0" class="empty-state">
            <CheckCircle size="32" class="empty-icon" />
            <p>暂无紧急任务，太棒了！</p>
          </div>
        </div>
      </section>
    </div>

    <!-- Bottom Row -->
    <div class="bottom-grid">
      <!-- Team Activity -->
      <section class="section glass">
        <div class="section-header">
          <h2>团队动态</h2>
        </div>
        <div class="activity-list">
          <div
            v-for="(activity, index) in teamActivity"
            :key="index"
            class="activity-item"
          >
            <div class="activity-dot" :style="{ background: activity.color }" />
            <div class="activity-content">
              <p>
                <strong>{{ activity.user }}</strong>
                {{ activity.action }}
                <strong>{{ activity.target }}</strong>
              </p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="section glass">
        <div class="section-header">
          <h2>快速操作</h2>
        </div>
        <div class="quick-actions">
          <button class="action-btn glass" @click="navigateTo('/kanban')">
            <Plus size="20" />
            <span>新建任务</span>
          </button>
          <button class="action-btn glass" @click="createProject">
            <FolderKanban size="20" />
            <span>新建项目</span>
          </button>
          <button class="action-btn glass" @click="navigateTo('/team')">
            <Users size="20" />
            <span>邀请成员</span>
          </button>
          <button class="action-btn glass" @click="navigateTo('/stats')">
            <TrendingUp size="20" />
            <span>查看报表</span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.section {
  border-radius: var(--radius-xl);
  padding: 24px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.project-card {
  display: block;
  text-decoration: none;
  color: inherit;
}

.project-card.add-project {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  text-align: center;
  border: 2px dashed var(--glass-border);
  background: transparent;
  transition: all var(--transition-base);
}

.project-card.add-project:hover {
  border-color: var(--accent-blue);
  background: rgba(0, 113, 227, 0.04);
}

.add-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: rgba(0, 113, 227, 0.1);
  color: var(--accent-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.project-card.add-project h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.project-card.add-project p {
  font-size: 13px;
  color: var(--text-tertiary);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  text-align: center;
  color: var(--text-tertiary);
}

.empty-icon {
  margin-bottom: 12px;
  opacity: 0.5;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding: 8px 0;
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.activity-content p {
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.5;
  margin-bottom: 4px;
}

.activity-content strong {
  font-weight: 600;
}

.activity-time {
  font-size: 11px;
  color: var(--text-tertiary);
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 16px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-secondary);
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--accent-blue);
  transform: translateY(-2px);
}

.action-btn span {
  font-size: 13px;
  font-weight: 500;
}

@media (max-width: 1023px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .section {
    padding: 16px;
  }
}
</style>