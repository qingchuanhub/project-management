<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  FolderKanban, Clock, CheckCircle2, Activity,
  Plus, ArrowRight, Users, Zap, BarChart3, FolderPlus
} from 'lucide-vue-next'
import StatCard from '../components/StatCard.vue'
import ProjectCard from '../components/ProjectCard.vue'
import TaskCard from '../components/TaskCard.vue'
import { useProjectsStore, useTasksStore, useUsersStore } from '../store'

const router = useRouter()
const projects = useProjectsStore()
const tasksStore = useTasksStore()
const usersStore = useUsersStore()

const stats = computed(() => {
  const mine = tasksStore.byProject('p1')
  const done = tasksStore.tasks.filter((t) => t.col === 'done').length
  return [
    { label: '进行中项目', value: projects.active.length, icon: FolderKanban, color: '#0071e3', trend: '+1 本季' },
    { label: '待办任务', value: tasksStore.tasks.filter((t) => t.col === 'todo').length, icon: Clock, color: '#ff9f0a', trend: '需关注' },
    { label: '进行中任务', value: tasksStore.tasks.filter((t) => t.col === 'doing').length, icon: Activity, color: '#bf5af2', trend: '推进中' },
    { label: '已完成任务', value: done, icon: CheckCircle2, color: '#30d158', trend: '+18%' }
  ]
})

const urgent = computed(() =>
  tasksStore.tasks
    .filter((t) => t.col !== 'done' && t.priority === 'high')
    .slice(0, 5)
)

const feed = [
  { name: 'Sarah Chen', text: '完成了任务「编写接口文档」', time: '10 分钟前', color: '#30d158' },
  { name: 'Mike Wu', text: '评论了「实现 OAuth 登录流程」', time: '30 分钟前', color: '#0071e3' },
  { name: 'Emily Zhang', text: '创建了任务「新用户引导流程」', time: '2 小时前', color: '#bf5af2' },
  { name: '林青川', text: '将项目进度更新为 68%', time: '4 小时前', color: '#ff9f0a' }
]

const quick = [
  { label: '新建任务', icon: Plus, action: () => router.push('/kanban') },
  { label: '新建项目', icon: FolderPlus, action: () => router.push('/projects') },
  { label: '邀请成员', icon: Users, action: () => router.push('/team') },
  { label: '查看报表', icon: BarChart3, action: () => router.push('/stats') }
]
</script>

<template>
  <div>
    <div class="head">
      <div>
        <h1>仪表盘</h1>
        <p class="sub">欢迎回来，今天也要高效协作 ✨</p>
      </div>
      <button class="btn btn-primary" @click="router.push('/kanban')">
        <Plus :size="16" /> 新建任务
      </button>
    </div>

    <div class="stats">
      <StatCard v-for="s in stats" :key="s.label" v-bind="s" />
    </div>

    <div class="grid-2">
      <section class="panel glass">
        <div class="p-head">
          <h2>进行中的项目</h2>
          <router-link to="/projects" class="btn btn-ghost btn-sm">
            全部 <ArrowRight :size="14" />
          </router-link>
        </div>
        <div class="pgrid">
          <ProjectCard
            v-for="p in projects.projects.slice(0, 3)"
            :key="p.id"
            :project="p"
            @click="router.push('/projects')"
          />
        </div>
      </section>

      <section class="panel glass">
        <div class="p-head">
          <h2>高优先级任务</h2>
          <router-link to="/kanban" class="btn btn-ghost btn-sm">
            看板 <ArrowRight :size="14" />
          </router-link>
        </div>
        <div class="tlist">
          <TaskCard v-for="t in urgent" :key="t.id" :task="t" />
          <div v-if="!urgent.length" class="empty">
            <CheckCircle2 :size="34" />
            <span>暂无紧急任务，太棒了！</span>
          </div>
        </div>
      </section>
    </div>

    <div class="grid-2">
      <section class="panel glass">
        <div class="p-head"><h2>团队动态</h2></div>
        <ul class="feed">
          <li v-for="(f, i) in feed" :key="i">
            <i class="fdot" :style="{ background: f.color }"></i>
            <div>
              <p><b>{{ f.name }}</b> {{ f.text }}</p>
              <small>{{ f.time }}</small>
            </div>
          </li>
        </ul>
      </section>

      <section class="panel glass">
        <div class="p-head"><h2>快速操作</h2></div>
        <div class="quick">
          <button v-for="q in quick" :key="q.label" class="qbtn" @click="q.action()">
            <component :is="q.icon" :size="20" />
            <span>{{ q.label }}</span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
h1 {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
}
.sub {
  font-size: 13px;
  color: var(--text-2);
  margin-top: 3px;
}
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.grid-2 {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
.panel {
  border-radius: var(--r-xl);
  padding: 20px;
}
.p-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.p-head h2 {
  font-size: 16px;
  font-weight: 700;
}
.pgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}
.tlist {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.feed {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.feed li {
  display: flex;
  gap: 11px;
}
.fdot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}
.feed p {
  font-size: 13px;
}
.feed b { font-weight: 600; }
.feed small {
  font-size: 11px;
  color: var(--text-3);
}
.quick {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.qbtn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 10px;
  background: var(--bg-input);
  border: none;
  border-radius: var(--r-md);
  color: var(--text-2);
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.16s;
}
.qbtn:hover {
  background: rgba(0, 113, 227, 0.1);
  color: var(--blue);
  transform: translateY(-2px);
}
@media (max-width: 1000px) {
  .grid-2 { grid-template-columns: 1fr; }
}
</style>
