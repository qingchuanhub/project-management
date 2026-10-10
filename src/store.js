import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/* ============ 用户 ============ */
export const useUsersStore = defineStore('users', () => {
  const users = ref([
    { id: '1', name: '林青川', email: 'qingchuan@team.com', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=lin', role: 'admin', status: 'online' },
    { id: '2', name: 'Sarah Chen', email: 'sarah@team.com', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=sarah', role: 'member', status: 'online' },
    { id: '3', name: 'Mike Wu', email: 'mike@team.com', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=mike', role: 'member', status: 'away' },
    { id: '4', name: 'Emily Zhang', email: 'emily@team.com', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=emily', role: 'member', status: 'offline' },
    { id: '5', name: 'David Lin', email: 'david@team.com', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=david', role: 'member', status: 'busy' }
  ])

  const get = (id) => users.value.find((u) => u.id === id)

  return { users, get }
})

/* ============ 项目 ============ */
export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([
    {
      id: 'p1',
      name: 'Project Alpha',
      desc: '核心产品重构与体验升级',
      status: 'active',
      progress: 68,
      start: '2026-07-01',
      end: '2026-11-30',
      color: '#0071e3',
      icon: '🚀',
      members: ['1', '2', '3'],
      tags: ['产品', '重构']
    },
    {
      id: 'p2',
      name: '移动端 App 2.0',
      desc: '全新架构的跨平台移动应用',
      status: 'active',
      progress: 35,
      start: '2026-08-15',
      end: '2026-12-31',
      color: '#30d158',
      icon: '📱',
      members: ['2', '4'],
      tags: ['移动端']
    },
    {
      id: 'p3',
      name: 'API 网关迁移',
      desc: '迁移至微服务架构，提升可用性',
      status: 'planning',
      progress: 12,
      start: '2026-09-01',
      end: '2027-02-28',
      color: '#ff9f0a',
      icon: '⚙️',
      members: ['1', '3', '5'],
      tags: ['后端', '架构']
    },
    {
      id: 'p4',
      name: '设计系统 v3',
      desc: '统一多端设计语言与组件库',
      status: 'completed',
      progress: 100,
      start: '2026-03-01',
      end: '2026-06-30',
      color: '#bf5af2',
      icon: '🎨',
      members: ['4'],
      tags: ['设计']
    }
  ])

  const active = computed(() => projects.value.filter((p) => p.status === 'active'))

  function add(p) {
    projects.value.push({
      ...p,
      id: 'p' + Date.now(),
      progress: 0,
      members: [],
      tags: []
    })
  }

  function update(id, patch) {
    const i = projects.value.findIndex((p) => p.id === id)
    if (i > -1) Object.assign(projects.value[i], patch)
  }

  function remove(id) {
    projects.value = projects.value.filter((p) => p.id !== id)
  }

  return { projects, active, add, update, remove }
})

/* ============ 任务 ============ */
export const useTasksStore = defineStore('tasks', () => {
  const columns = [
    { id: 'todo', title: '待办', color: '#86868b' },
    { id: 'doing', title: '进行中', color: '#0071e3' },
    { id: 'review', title: '待审查', color: '#ff9f0a' },
    { id: 'done', title: '已完成', color: '#30d158' }
  ]

  const tasks = ref([
    { id: 't1', pid: 'p1', col: 'todo', title: '设计新版仪表盘布局', desc: '完成线框图与高保真视觉稿', priority: 'high', assignee: '1', due: '2026-10-25', tags: ['设计'], order: 0 },
    { id: 't2', pid: 'p1', col: 'todo', title: '编写接口文档', desc: '覆盖全部 REST 端点', priority: 'medium', assignee: '3', due: '2026-10-20', tags: ['文档'], order: 1 },
    { id: 't3', pid: 'p1', col: 'doing', title: '实现 OAuth 登录流程', desc: '接入 GitHub 与 Google 第三方登录', priority: 'high', assignee: '2', due: '2026-10-18', tags: ['后端', '认证'], order: 0 },
    { id: 't4', pid: 'p1', col: 'doing', title: '暗色模式适配', desc: '全部页面适配深色主题', priority: 'medium', assignee: '4', due: '2026-10-22', tags: ['前端'], order: 1 },
    { id: 't5', pid: 'p1', col: 'review', title: 'CI/CD 流水线搭建', desc: 'GitHub Actions 自动测试与部署', priority: 'medium', assignee: '5', due: '2026-10-15', tags: ['DevOps'], order: 0 },
    { id: 't6', pid: 'p1', col: 'done', title: '项目脚手架初始化', desc: 'Vite + Vue 3 基础工程', priority: 'high', assignee: '1', due: '2026-10-10', tags: ['工程化'], order: 0 },
    { id: 't7', pid: 'p2', col: 'todo', title: '新用户引导流程', desc: '设计并实现移动端引导页', priority: 'high', assignee: '4', due: '2026-11-05', tags: ['设计'], order: 0 },
    { id: 't8', pid: 'p2', col: 'doing', title: '推送通知服务', desc: '集成 FCM 实现消息推送', priority: 'medium', assignee: '2', due: '2026-11-15', tags: ['后端'], order: 0 },
    { id: 't9', pid: 'p3', col: 'todo', title: '服务网格配置', desc: '部署 Istio 流量治理', priority: 'high', assignee: '5', due: '2026-11-01', tags: ['架构'], order: 0 },
    { id: 't10', pid: 'p3', col: 'doing', title: '分布式限流实现', desc: '基于 Redis 的全局限流', priority: 'medium', assignee: '1', due: '2026-10-30', tags: ['后端'], order: 0 },
    { id: 't11', pid: 'p4', col: 'done', title: '色板与设计令牌', desc: '定义语义化色彩变量', priority: 'high', assignee: '4', due: '2026-06-01', tags: ['设计'], order: 0 },
    { id: 't12', pid: 'p4', col: 'done', title: '组件库 v1.0', desc: '核心组件开发与文档', priority: 'high', assignee: '2', due: '2026-06-25', tags: ['前端'], order: 1 }
  ])

  function byProject(pid) {
    return tasks.value.filter((t) => t.pid === pid)
  }

  function byCol(pid, col) {
    return tasks.value
      .filter((t) => t.pid === pid && t.col === col)
      .sort((a, b) => a.order - b.order)
  }

  function add(t) {
    const maxOrder = Math.max(-1, ...byCol(t.pid, t.col).map((x) => x.order))
    tasks.value.push({ ...t, id: 't' + Date.now(), order: maxOrder + 1 })
  }

  function update(id, patch) {
    const i = tasks.value.findIndex((t) => t.id === id)
    if (i > -1) Object.assign(tasks.value[i], patch)
  }

  function remove(id) {
    tasks.value = tasks.value.filter((t) => t.id !== id)
  }

  function move(id, col, index) {
    const t = tasks.value.find((x) => x.id === id)
    if (!t) return
    const oldCol = t.col
    const oldOrder = t.order
    const siblings = byCol(t.pid, col)

    if (oldCol === col) {
      siblings.forEach((s) => {
        if (s.id === id) return
        if (oldOrder < index && s.order > oldOrder && s.order < index) update(s.id, { order: s.order - 1 })
        else if (oldOrder > index && s.order >= index && s.order < oldOrder) update(s.id, { order: s.order + 1 })
      })
    } else {
      byCol(t.pid, oldCol).forEach((s) => {
        if (s.order > oldOrder) update(s.id, { order: s.order - 1 })
      })
      siblings.forEach((s, i) => {
        if (i >= index) update(s.id, { order: s.order + 1 })
      })
    }
    update(id, { col, order: index })
  }

  return { columns, tasks, byProject, byCol, add, update, remove, move }
})

/* ============ 认证 ============ */
const ACC_KEY = 'pf_accounts'
const SES_KEY = 'pf_session'

function loadAccounts() {
  try {
    const list = JSON.parse(localStorage.getItem(ACC_KEY) || '[]')
    if (!list.length) {
      // 预置演示账号 demo@demo.com / 123456
      const demo = { id: 'u1', name: '林青川', email: 'demo@demo.com', pass: btoa('123456'), avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=lin' }
      list.push(demo)
      localStorage.setItem(ACC_KEY, JSON.stringify(list))
    }
    return list
  } catch {
    return []
  }
}

export const useAuthStore = defineStore('auth', () => {
  const session = ref(JSON.parse(localStorage.getItem(SES_KEY) || 'null'))
  const accounts = ref(loadAccounts())

  const isAuthed = computed(() => !!session.value)

  function persist() {
    localStorage.setItem(ACC_KEY, JSON.stringify(accounts.value))
    if (session.value) localStorage.setItem(SES_KEY, JSON.stringify(session.value))
    else localStorage.removeItem(SES_KEY)
  }

  function register(name, email, password) {
    email = (email || '').trim().toLowerCase()
    if (!name || !email || !password) return { ok: false, msg: '请填写完整信息' }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, msg: '邮箱格式不正确' }
    if (password.length < 6) return { ok: false, msg: '密码至少 6 位' }
    if (accounts.value.some((a) => a.email === email)) return { ok: false, msg: '该邮箱已注册' }
    const acc = {
      id: 'u' + Date.now(),
      name: name.trim(),
      email,
      pass: btoa(password),
      avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(email)}`
    }
    accounts.value.push(acc)
    session.value = { id: acc.id, name: acc.name, email: acc.email, avatar: acc.avatar }
    persist()
    return { ok: true }
  }

  function login(email, password) {
    email = (email || '').trim().toLowerCase()
    const acc = accounts.value.find((a) => a.email === email)
    if (!acc || acc.pass !== btoa(password)) return { ok: false, msg: '邮箱或密码错误' }
    session.value = { id: acc.id, name: acc.name, email: acc.email, avatar: acc.avatar }
    persist()
    return { ok: true }
  }

  function logout() {
    session.value = null
    persist()
  }

  return { session, isAuthed, register, login, logout }
})
