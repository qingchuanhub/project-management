import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/login', component: () => import('@/views/Login.vue'), meta: { public: true } },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: () => import('@/views/Dashboard.vue'), meta: { title: '仪表盘' } },
  { path: '/projects', component: () => import('@/views/Projects.vue'), meta: { title: '项目' } },
  { path: '/kanban', component: () => import('@/views/Kanban.vue'), meta: { title: '看板' } },
  { path: '/gantt', component: () => import('@/views/Gantt.vue'), meta: { title: '甘特图' } },
  { path: '/team', component: () => import('@/views/Team.vue'), meta: { title: '团队' } },
  { path: '/stats', component: () => import('@/views/Stats.vue'), meta: { title: '统计' } },
  { path: '/settings', component: () => import('@/views/Settings.vue'), meta: { title: '设置' } },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to) => {
  const authed = !!localStorage.getItem('pf_session')
  // 未登录 → 强制登录页
  if (!authed && !to.meta.public) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  // 已登录还访问登录页 → 回首页
  if (authed && to.path === '/login') {
    return '/dashboard'
  }
})

export default router
