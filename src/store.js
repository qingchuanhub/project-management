import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, isServerMode, setToken } from './api'

/* ============ 认证 ============ */
const ACC_KEY = 'pf_accounts'
const SES_KEY = 'pf_session'

function loadAccounts() {
  try {
    const list = JSON.parse(localStorage.getItem(ACC_KEY) || '[]')
    if (!list.length) {
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
    if (session.value) localStorage.setItem(SES_KEY, JSON.stringify(session.value))
    else localStorage.removeItem(SES_KEY)
  }

  async function register(name, email, password) {
    email = (email || '').trim().toLowerCase()
    if (!name || !email || !password) return { ok: false, msg: '请填写完整信息' }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, msg: '邮箱格式不正确' }
    if (password.length < 6) return { ok: false, msg: '密码至少 6 位' }

    if (isServerMode()) {
      try {
        const d = await api('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password })
        })
        setToken(d.token)
        session.value = d.user
        persist()
        return { ok: true }
      } catch (e) {
        return { ok: false, msg: e.message }
      }
    }

    if (accounts.value.some((a) => a.email === email)) return { ok: false, msg: '该邮箱已注册' }
    const acc = {
      id: 'u' + Date.now(),
      name: name.trim(),
      email,
      pass: btoa(password),
      avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(email)}`
    }
    accounts.value.push(acc)
    localStorage.setItem(ACC_KEY, JSON.stringify(accounts.value))
    session.value = { id: acc.id, name: acc.name, email: acc.email, avatar: acc.avatar }
    persist()
    return { ok: true }
  }

  async function login(email, password) {
    email = (email || '').trim().toLowerCase()

    if (isServerMode()) {
      try {
        const d = await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        })
        setToken(d.token)
        session.value = d.user
        persist()
        return { ok: true }
      } catch (e) {
        return { ok: false, msg: e.message }
      }
    }

    const acc = accounts.value.find((a) => a.email === email)
    if (!acc || acc.pass !== btoa(password)) return { ok: false, msg: '邮箱或密码错误' }
    session.value = { id: acc.id, name: acc.name, email: acc.email, avatar: acc.avatar }
    persist()
    return { ok: true }
  }

  function logout() {
    setToken('')
    session.value = null
    persist()
  }

  async function updateProfile(patch) {
    if (isServerMode()) {
      try {
        const d = await api('/auth/me', { method: 'PATCH', body: JSON.stringify(patch) })
        session.value = { ...session.value, ...d.user }
        persist()
        return { ok: true }
      } catch (e) {
        return { ok: false, msg: e.message }
      }
    }
    session.value = { ...session.value, ...patch }
    persist()
    return { ok: true }
  }

  async function deleteAccount() {
    if (isServerMode()) {
      try {
        await api('/auth/me', { method: 'DELETE' })
        logout()
        return { ok: true }
      } catch (e) {
        return { ok: false, msg: e.message }
      }
    }
    // 本地模式：从 accounts 移除
    const email = session.value && session.value.email
    if (email) {
      accounts.value = accounts.value.filter((a) => a.email !== email)
      localStorage.setItem(ACC_KEY, JSON.stringify(accounts.value))
    }
    logout()
    return { ok: true }
  }

  return { session, isAuthed, register, login, logout, updateProfile, deleteAccount }
})

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
  const hydrate = (list) => { users.value = list }

  return { users, get, hydrate }
})

/* ============ 项目 ============ */
export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([
    {
      id: 'p1', name: 'Project Alpha', desc: '核心产品重构与体验升级',
      status: 'active', progress: 68, start: '2026-07-01', end: '2026-11-30',
      color: '#0071e3', icon: '🚀', members: ['1', '2', '3'], tags: ['产品', '重构']
    },
    {
      id: 'p2', name: '移动端 App 2.0', desc: '全新架构的跨平台移动应用',
      status: 'active', progress: 35, start: '2026-08-15', end: '2026-12-31',
      color: '#30d158', icon: '📱', members: ['2', '4'], tags: ['移动端']
    },
    {
      id: 'p3', name: 'API 网关迁移', desc: '迁移至微服务架构，提升可用性',
      status: 'planning', progress: 12, start: '2026-09-01', end: '2027-02-28',
      color: '#ff9f0a', icon: '⚙️', members: ['1', '3', '5'], tags: ['后端', '架构']
    },
    {
      id: 'p4', name: '设计系统 v3', desc: '统一多端设计语言与组件库',
      status: 'completed', progress: 100, start: '2026-03-01', end: '2026-06-30',
      color: '#bf5af2', icon: '🎨', members: ['4'], tags: ['设计']
    }
  ])

  const active = computed(() => projects.value.filter((p) => p.status === 'active'))
  const hydrate = (list) => { projects.value = list }

  async function add(p) {
    if (isServerMode()) {
      try {
        const d = await api('/projects', { method: 'POST', body: JSON.stringify(p) })
        projects.value.push(d.project)
        return
      } catch (e) {
        console.error(e)
      }
    }
    projects.value.push({ ...p, id: 'p' + Date.now(), progress: 0, members: [], tags: [] })
  }

  async function update(id, patch) {
    const i = projects.value.findIndex((p) => p.id === id)
    if (i > -1) Object.assign(projects.value[i], patch)
    if (isServerMode()) {
      try { await api('/projects/' + id, { method: 'PATCH', body: JSON.stringify(patch) }) } catch (e) { console.error(e) }
    }
  }

  async function remove(id) {
    projects.value = projects.value.filter((p) => p.id !== id)
    if (isServerMode()) {
      try { await api('/projects/' + id, { method: 'DELETE' }) } catch (e) { console.error(e) }
    }
  }

  return { projects, active, add, update, remove, hydrate }
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

  const hydrate = (list) => { tasks.value = list }
  const byProject = (pid) => tasks.value.filter((t) => t.pid === pid)
  const byCol = (pid, col) => tasks.value.filter((t) => t.pid === pid && t.col === col).sort((a, b) => a.order - b.order)

  function localMove(id, col, index) {
    const t = tasks.value.find((x) => x.id === id)
    if (!t) return
    const oldCol = t.col
    const oldOrder = t.order
    const siblings = byCol(t.pid, col)
    if (oldCol === col) {
      siblings.forEach((s) => {
        if (s.id === id) return
        if (oldOrder < index && s.order > oldOrder && s.order < index) updateLocal(s.id, { order: s.order - 1 })
        else if (oldOrder > index && s.order >= index && s.order < oldOrder) updateLocal(s.id, { order: s.order + 1 })
      })
    } else {
      byCol(t.pid, oldCol).forEach((s) => {
        if (s.order > oldOrder) updateLocal(s.id, { order: s.order - 1 })
      })
      siblings.forEach((s, i) => {
        if (i >= index) updateLocal(s.id, { order: s.order + 1 })
      })
    }
    updateLocal(id, { col, order: index })
  }

  function updateLocal(id, patch) {
    const i = tasks.value.findIndex((t) => t.id === id)
    if (i > -1) Object.assign(tasks.value[i], patch)
  }

  async function add(t) {
    if (isServerMode()) {
      try {
        const d = await api('/tasks', { method: 'POST', body: JSON.stringify(t) })
        tasks.value.push(d.task)
        return
      } catch (e) {
        console.error(e)
      }
    }
    const maxOrder = Math.max(-1, ...byCol(t.pid, t.col).map((x) => x.order))
    tasks.value.push({ ...t, id: 't' + Date.now(), order: maxOrder + 1 })
  }

  async function update(id, patch) {
    updateLocal(id, patch)
    if (isServerMode()) {
      try { await api('/tasks/' + id, { method: 'PATCH', body: JSON.stringify(patch) }) } catch (e) { console.error(e) }
    }
  }

  async function remove(id) {
    tasks.value = tasks.value.filter((t) => t.id !== id)
    if (isServerMode()) {
      try { await api('/tasks/' + id, { method: 'DELETE' }) } catch (e) { console.error(e) }
    }
  }

  async function move(id, col, index) {
    localMove(id, col, index)
    if (isServerMode()) {
      try {
        const d = await api('/tasks/move', { method: 'POST', body: JSON.stringify({ id, col, index }) })
        if (d.tasks) tasks.value = d.tasks
      } catch (e) {
        console.error(e)
      }
    }
  }

  return { columns, tasks, byProject, byCol, add, update, remove, move, hydrate }
})

/* ============ Break UI: 最坏数据测试 ============ */
import { worstCaseData, demoData, emptyData, oneData, thousandData, DATA_MODES, getDataByMode } from './break-data'

export const useBreakStore = defineStore('break', () => {
  const mode = ref('demo')
  const isDev = ref(import.meta.env.DEV)

  const modes = DATA_MODES
  const labels = {
    demo: '演示数据',
    worst: '最坏情况',
    empty: '空数据',
    one: '单条数据',
    thousand: '千条数据'
  }

  function setMode(m) {
    if (modes.includes(m)) {
      mode.value = m
      applyData()
    }
  }

  function applyData() {
    const data = getDataByMode(mode.value)
    // 使用动态导入避免循环依赖
    import('./store.js').then(({ useUsersStore, useProjectsStore, useTasksStore }) => {
      const usersStore = useUsersStore()
      const projectsStore = useProjectsStore()
      const tasksStore = useTasksStore()
      usersStore.hydrate(data.users)
      projectsStore.hydrate(data.projects)
      tasksStore.hydrate(data.tasks)
    })
  }

  function reset() {
    mode.value = 'demo'
    applyData()
  }

  // 初始化时应用当前模式
  if (isDev.value) {
    // 从 URL 参数恢复模式
    const urlParams = new URLSearchParams(window.location.search)
    const urlMode = urlParams.get('data')
    if (urlMode && DATA_MODES.includes(urlMode)) {
      mode.value = urlMode
    }
    applyData()
  }

  return { mode, modes, labels, isDev, setMode, reset, applyData }
})
