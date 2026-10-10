<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard, FolderKanban, ListTodo, GitBranch,
  Users, BarChart3, Settings, Search, Bell, Sun, Moon,
  Menu, X, Plus, LogOut, User as UserIcon, ChevronLeft, ChevronRight
} from 'lucide-vue-next'
import { useUsersStore } from './store'

const route = useRoute()
const router = useRouter()
const users = useUsersStore()

const collapsed = ref(false)
const mobileOpen = ref(false)
const dark = ref(localStorage.getItem('theme') === 'dark')
const searchQ = ref('')
const showBell = ref(false)
const showUser = ref(false)

const navs = [
  { to: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { to: '/projects', label: '项目', icon: FolderKanban },
  { to: '/kanban', label: '看板', icon: ListTodo },
  { to: '/gantt', label: '甘特图', icon: GitBranch },
  { to: '/team', label: '团队', icon: Users },
  { to: '/stats', label: '统计', icon: BarChart3 },
  { to: '/settings', label: '设置', icon: Settings }
]

watch(dark, (v) => {
  document.documentElement.classList.toggle('dark', v)
  localStorage.setItem('theme', v ? 'dark' : 'light')
}, { immediate: true })

watch(() => route.path, () => {
  mobileOpen.value = false
  showBell.value = false
  showUser.value = false
})

const me = () => users.get('1')

function doSearch() {
  if (searchQ.value.trim()) router.push('/projects')
}
</script>

<template>
  <div class="app" :class="{ collapsed }">
    <!-- 侧边栏 -->
    <aside class="sidebar glass-strong" :class="{ open: mobileOpen }">
      <div class="side-head">
        <div class="logo" @click="router.push('/dashboard')">
          <span class="logo-mark">◆</span>
          <span v-show="!collapsed" class="logo-text">ProjectFlow</span>
        </div>
        <button class="btn btn-icon btn-ghost collapse-btn" @click="collapsed = !collapsed" v-show="!mobileOpen">
          <ChevronLeft v-if="!collapsed" :size="18" />
          <ChevronRight v-else :size="18" />
        </button>
      </div>

      <nav class="side-nav">
        <router-link
          v-for="n in navs"
          :key="n.to"
          :to="n.to"
          class="nav-item"
          :class="{ active: route.path === n.to }"
        >
          <component :is="n.icon" :size="19" />
          <span v-show="!collapsed" class="nav-label">{{ n.label }}</span>
          <span v-show="collapsed" class="nav-tip">{{ n.label }}</span>
        </router-link>
      </nav>

      <div class="side-foot" v-show="!collapsed">
        <router-link to="/settings" class="me-card">
          <img :src="me()?.avatar" class="me-avatar" :alt="me()?.name" />
          <div class="me-info">
            <span class="me-name">{{ me()?.name }}</span>
            <span class="me-role">管理员</span>
          </div>
        </router-link>
      </div>
    </aside>

    <div class="shade" v-if="mobileOpen" @click="mobileOpen = false"></div>

    <!-- 主区域 -->
    <div class="main">
      <header class="topbar glass-strong">
        <button class="btn btn-icon btn-ghost only-mobile" @click="mobileOpen = true">
          <Menu :size="20" />
        </button>

        <form class="search" @submit.prevent="doSearch">
          <Search :size="16" class="search-ico" />
          <input v-model="searchQ" class="search-input" placeholder="搜索项目、任务、成员…" />
        </form>

        <div class="acts">
          <!-- 通知 -->
          <div class="pop-wrap">
            <button class="btn btn-icon btn-ghost" @click="showBell = !showBell; showUser = false">
              <Bell :size="19" />
              <i class="dot">3</i>
            </button>
            <transition name="fade">
              <div class="pop glass-strong" v-if="showBell">
                <div class="pop-title">通知</div>
                <div class="note" v-for="n in 3" :key="n">
                  <span class="note-dot" :style="{ background: ['#0071e3','#ff9f0a','#30d158'][n-1] }"></span>
                  <div>
                    <p>{{ ['新任务已分配给你','项目进度更新至 68%','Sarah 评论了你的任务'][n-1] }}</p>
                    <small>{{ ['5 分钟前','1 小时前','3 小时前'][n-1] }}</small>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <!-- 用户 -->
          <div class="pop-wrap">
            <button class="btn btn-icon avatar-btn" @click="showUser = !showUser; showBell = false">
              <img :src="me()?.avatar" :alt="me()?.name" />
            </button>
            <transition name="fade">
              <div class="pop glass-strong" v-if="showUser">
                <div class="me-card" style="margin:4px">
                  <img :src="me()?.avatar" class="me-avatar" :alt="me()?.name" />
                  <div class="me-info">
                    <span class="me-name">{{ me()?.name }}</span>
                    <span class="me-role">{{ me()?.email }}</span>
                  </div>
                </div>
                <hr class="hr" />
                <button class="pop-item"><UserIcon :size="15" /> 个人资料</button>
                <router-link to="/settings" class="pop-item"><Settings :size="15" /> 设置</router-link>
                <hr class="hr" />
                <button class="pop-item danger"><LogOut :size="15" /> 退出登录</button>
              </div>
            </transition>
          </div>

          <button class="btn btn-icon btn-ghost" @click="dark = !dark">
            <Moon v-if="dark" :size="19" />
            <Sun v-else :size="19" />
          </button>
        </div>
      </header>

      <main class="page">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  height: 100vh;
  background: var(--bg);
}

/* ---- 侧边栏 ---- */
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: var(--sidebar-w);
  display: flex;
  flex-direction: column;
  z-index: 100;
  border-right: 1px solid var(--border-glass);
  transition: width 0.25s ease, transform 0.25s ease;
}
.app.collapsed .sidebar {
  width: 76px;
}
.side-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--topbar-h);
  padding: 0 14px;
  border-bottom: 1px solid var(--border-glass);
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  padding: 6px 8px;
  border-radius: var(--r-sm);
}
.logo-mark {
  font-size: 20px;
  color: var(--blue);
}
.logo-text {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.3px;
}
.side-nav {
  flex: 1;
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-y: auto;
}
.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border-radius: var(--r-md);
  color: var(--text-2);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.16s ease;
}
.nav-item:hover {
  background: var(--bg-input);
  color: var(--text);
}
.nav-item.active {
  background: rgba(0, 113, 227, 0.1);
  color: var(--blue);
}
.nav-label { white-space: nowrap; }
.nav-tip {
  position: absolute;
  left: calc(100% + 10px);
  background: var(--text);
  color: var(--bg);
  padding: 5px 10px;
  border-radius: 7px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s;
  z-index: 50;
}
.app.collapsed .nav-item:hover .nav-tip {
  opacity: 1;
}
.side-foot {
  padding: 12px;
  border-top: 1px solid var(--border-glass);
}
.me-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--r-md);
  background: var(--bg-input);
  text-decoration: none;
}
.me-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--bg-soft);
}
.me-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.me-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}
.me-role {
  font-size: 11px;
  color: var(--text-3);
}
.shade {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 99;
}

/* ---- 主区域 ---- */
.main {
  flex: 1;
  margin-left: var(--sidebar-w);
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: margin-left 0.25s ease;
}
.app.collapsed .main {
  margin-left: 76px;
}
.topbar {
  height: var(--topbar-h);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-glass);
  z-index: 50;
}
.only-mobile { display: none; }
.search {
  position: relative;
  flex: 1;
  max-width: 420px;
}
.search-ico {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-3);
}
.search-input {
  width: 100%;
  padding: 8px 14px 8px 36px;
  font-size: 13px;
  font-family: inherit;
  background: var(--bg-input);
  border: none;
  border-radius: 100px;
  color: var(--text);
  outline: none;
  transition: all 0.18s;
}
.search-input:focus {
  background: var(--bg-solid);
  box-shadow: 0 0 0 2px rgba(0, 113, 227, 0.3);
}
.acts {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}
.dot {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 15px;
  height: 15px;
  font-size: 9px;
  font-style: normal;
  font-weight: 700;
  background: var(--red);
  color: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
}
.avatar-btn {
  padding: 2px;
  border-radius: 50%;
}
.avatar-btn img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--bg-soft);
}
.pop-wrap { position: relative; }
.pop {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 260px;
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);
  padding: 8px;
  z-index: 200;
}
.pop-title {
  font-size: 13px;
  font-weight: 700;
  padding: 8px 10px;
  color: var(--text);
}
.note {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: var(--r-md);
  transition: background 0.15s;
  cursor: pointer;
}
.note:hover { background: var(--bg-input); }
.note-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
}
.note p {
  font-size: 13px;
  color: var(--text);
}
.note small {
  font-size: 11px;
  color: var(--text-3);
}
.hr {
  border: none;
  border-top: 1px solid var(--border-glass);
  margin: 6px 4px;
}
.pop-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 9px 10px;
  font-size: 13px;
  font-family: inherit;
  background: none;
  border: none;
  border-radius: var(--r-sm);
  color: var(--text);
  cursor: pointer;
  text-align: left;
  text-decoration: none;
}
.pop-item:hover { background: var(--bg-input); }
.pop-item.danger { color: var(--red); }

.page {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 900px) {
  .sidebar { transform: translateX(-100%); width: var(--sidebar-w) !important; }
  .sidebar.open { transform: translateX(0); }
  .app.collapsed .main { margin-left: 0; }
  .main { margin-left: 0; }
  .only-mobile { display: inline-flex; }
  .search { max-width: none; }
  .page { padding: 16px; }
}
</style>
