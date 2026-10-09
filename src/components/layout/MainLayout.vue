<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  LayoutDashboard, FolderKanban, Kanban, GitBranch,
  Users, BarChart2, Settings, ChevronLeft, ChevronRight,
  Menu, X, Sun, Moon, Bell, Search, Plus, User, LogOut
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapsed = ref(false)
const isMobileMenuOpen = ref(false)
const isDark = ref(false)
const searchQuery = ref('')
const showNotifications = ref(false)
const showUserMenu = ref(false)

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Kanban', path: '/kanban', icon: Kanban },
  { name: 'Gantt', path: '/gantt', icon: GitBranch },
  { name: 'Team', path: '/team', icon: Users },
  { name: 'Stats', path: '/stats', icon: BarChart2 },
  { name: 'Settings', path: '/settings', icon: Settings }
]

const currentUser = computed(() => userStore.currentUser)

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}

function closeMenus() {
  showNotifications.value = false
  showUserMenu.value = false
}

function logout() {
  closeMenus()
  // Handle logout
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = savedTheme === 'dark' || (!savedTheme && prefersDark)
  document.documentElement.classList.toggle('dark', isDark.value)

  document.addEventListener('click', handleOutsideClick)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  document.removeEventListener('keydown', handleKeydown)
})

function handleOutsideClick(e) {
  if (!e.target.closest('.user-menu')) showUserMenu.value = false
  if (!e.target.closest('.notifications')) showNotifications.value = false
}

function handleKeydown(e) {
  if (e.key === 'Escape') closeMenus()
  if (e.metaKey && e.key === 'k') {
    e.preventDefault()
    document.querySelector('.search-input')?.focus()
  }
}
</script>

<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside
      class="sidebar glass-strong"
      :class="{ collapsed: isCollapsed, 'mobile-open': isMobileMenuOpen }"
      role="navigation"
      aria-label="主导航"
    >
      <div class="sidebar-header">
        <div class="logo" @click="router.push('/dashboard')">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" class="logo-icon">
            <rect width="32" height="32" rx="8" :fill="currentUser?.avatar ? 'none' : 'var(--accent-blue)'"/>
            <path d="M8 12h16M8 16h12M8 20h8" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <span class="logo-text" v-show="!isCollapsed">ProjectFlow</span>
        </div>
        <button
          class="btn btn-icon sidebar-toggle"
          @click="toggleSidebar"
          :aria-label="isCollapsed ? '展开侧边栏' : '折叠侧边栏'"
          v-show="!isMobileMenuOpen"
        >
          <ChevronLeft v-show="!isCollapsed" size="18" />
          <ChevronRight v-show="isCollapsed" size="18" />
        </button>
      </div>

      <nav class="sidebar-nav" aria-label="主菜单">
        <ul role="list">
          <li v-for="item in navItems" :key="item.name">
            <router-link
              :to="item.path"
              class="nav-link glass"
              :class="{ active: route.path.startsWith(item.path) && !(item.name === 'Dashboard' && route.path !== '/dashboard') }"
              :aria-current="route.path.startsWith(item.path) && !(item.name === 'Dashboard' && route.path !== '/dashboard') ? 'page' : undefined"
            >
              <component :is="item.icon" class="nav-icon" size="20" />
              <span class="nav-text" v-show="!isCollapsed">{{ item.name }}</span>
              <span class="nav-tooltip" v-show="isCollapsed">{{ item.name }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer" v-show="!isCollapsed">
        <div class="user-info glass">
          <img :src="currentUser?.avatar" :alt="currentUser?.name" class="user-avatar" />
          <div class="user-details">
            <span class="user-name">{{ currentUser?.name }}</span>
            <span class="user-role">{{ currentUser?.role }}</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Mobile Overlay -->
    <div
      class="sidebar-overlay"
      v-show="isMobileMenuOpen"
      @click="toggleMobileMenu"
      aria-hidden="true"
    />

    <!-- Main Content -->
    <main class="main-content" :class="{ 'sidebar-collapsed': isCollapsed }">
      <!-- Top Header -->
      <header class="top-header glass-strong" role="banner">
        <button
          class="btn btn-icon mobile-menu-btn"
          @click="toggleMobileMenu"
          aria-label="打开菜单"
          v-show="window.innerWidth < 1024"
        >
          <Menu size="22" />
        </button>

        <div class="search-wrapper">
          <Search class="search-icon" size="18" />
          <input
            type="search"
            class="search-input input"
            placeholder="搜索项目、任务、成员... (⌘K)"
            v-model="searchQuery"
            @keydown.enter="handleSearch"
            aria-label="搜索"
          />
        </div>

        <div class="header-actions">
          <div class="notifications relative">
            <button
              class="btn btn-icon"
              @click="showNotifications = !showNotifications"
              aria-label="通知"
              :aria-expanded="showNotifications"
            >
              <Bell size="20" />
              <span class="notification-badge">3</span>
            </button>

            <div
              class="dropdown-panel glass-strong"
              v-show="showNotifications"
              role="menu"
            >
              <div class="dropdown-header">
                <h3>通知</h3>
                <button class="btn btn-ghost btn-sm">全部已读</button>
              </div>
              <ul class="notification-list" role="list">
                <li v-for="i in 3" :key="i" class="notification-item">
                  <div class="notification-icon blue"><Plus size="14" /></div>
                  <div class="notification-content">
                    <p>新任务分配给你</p>
                    <span class="notification-time">5分钟前</span>
                  </div>
                </li>
                <li class="notification-item">
                  <div class="notification-icon orange"><GitBranch size="14" /></div>
                  <div class="notification-content">
                    <p>项目 "API Gateway" 进度更新</p>
                    <span class="notification-time">1小时前</span>
                  </div>
                </li>
                <li class="notification-item">
                  <div class="notification-icon green"><Users size="14" /></div>
                  <div class="notification-content">
                    <p>Sarah 评论了你的任务</p>
                    <span class="notification-time">3小时前</span>
                  </div>
                </li>
              </ul>
              <a href="#" class="dropdown-footer">查看全部通知</a>
            </div>
          </div>

          <div class="user-menu relative">
            <button
              class="btn btn-icon user-avatar-btn"
              @click="showUserMenu = !showUserMenu"
              aria-label="用户菜单"
              :aria-expanded="showUserMenu"
            >
              <img :src="currentUser?.avatar" :alt="currentUser?.name" class="header-avatar" />
            </button>

            <div
              class="dropdown-panel glass-strong user-dropdown"
              v-show="showUserMenu"
              role="menu"
            >
              <div class="user-menu-header">
                <img :src="currentUser?.avatar" :alt="currentUser?.name" class="user-avatar" />
                <div>
                  <p class="user-name">{{ currentUser?.name }}</p>
                  <p class="user-email">{{ currentUser?.email }}</p>
                </div>
              </div>
              <hr class="menu-divider" />
              <a href="#" class="dropdown-item" role="menuitem">
                <User size="16" /> 个人资料
              </a>
              <a href="#" class="dropdown-item" role="menuitem">
                <Settings size="16" /> 设置
              </a>
              <hr class="menu-divider" />
              <button class="dropdown-item danger" @click="logout" role="menuitem">
                <LogOut size="16" /> 退出登录
              </button>
            </div>
          </div>

          <button
            class="btn btn-icon"
            @click="toggleTheme"
            :aria-label="isDark ? '切换到浅色模式' : '切换到深色模式'"
          >
            <Sun v-show="isDark" size="20" />
            <Moon v-show="!isDark" size="20" />
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <div class="page-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: width var(--transition-base), transform var(--transition-base);
  border-right: 1px solid var(--glass-border);
  overflow: hidden;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed);
}

.sidebar.mobile-open {
  transform: translateX(0);
  box-shadow: var(--shadow-lg);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 16px;
  border-bottom: 1px solid var(--glass-border);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  border-radius: var(--radius-md);
  padding: 8px 12px;
  transition: background var(--transition-fast);
}

.logo:hover {
  background: rgba(0, 0, 0, 0.04);
}

.logo-icon {
  flex-shrink: 0;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-toggle {
  flex-shrink: 0;
  color: var(--text-secondary);
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
}

.sidebar-nav ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  position: relative;
}

.nav-link:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--text-primary);
}

.nav-link.active {
  background: rgba(0, 113, 227, 0.1);
  color: var(--accent-blue);
}

.nav-link.active::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: var(--accent-blue);
  border-radius: 0 3px 3px 0;
}

.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 12px;
}

.nav-icon {
  flex-shrink: 0;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
}

.nav-tooltip {
  position: absolute;
  left: calc(var(--sidebar-collapsed) + 8px);
  top: 50%;
  transform: translateY(-50%);
  background: var(--text-primary);
  color: var(--bg-primary);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: var(--shadow-md);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: all var(--transition-fast);
  z-index: 10;
}

.sidebar.collapsed .nav-link:hover .nav-tooltip {
  opacity: 1;
  visibility: visible;
  left: calc(var(--sidebar-collapsed) + 16px);
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--glass-border);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--glass-border);
}

.user-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: var(--text-tertiary);
  text-transform: capitalize;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
}

.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  min-width: 0;
  transition: margin-left var(--transition-base);
}

.main-content.sidebar-collapsed {
  margin-left: var(--sidebar-collapsed);
}

.top-header {
  position: sticky;
  top: 0;
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 50;
  border-bottom: 1px solid var(--glass-border);
}

.mobile-menu-btn {
  display: none;
  color: var(--text-secondary);
}

.search-wrapper {
  position: relative;
  flex: 1;
  max-width: 480px;
  margin: 0 24px;
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
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.relative {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  background: var(--accent-red);
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.dropdown-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 320px;
  max-height: 400px;
  border-radius: var(--radius-lg);
  padding: 8px;
  box-shadow: var(--shadow-lg);
  z-index: 100;
  overflow: hidden;
}

.user-dropdown {
  width: 260px;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
}

.btn-sm {
  padding: 4px 10px;
  font-size: 12px;
}

.notification-list {
  list-style: none;
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
  cursor: pointer;
}

.notification-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.notification-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon.blue { background: rgba(0, 113, 227, 0.1); color: var(--accent-blue); }
.notification-icon.orange { background: rgba(255, 159, 10, 0.1); color: var(--accent-orange); }
.notification-icon.green { background: rgba(48, 209, 88, 0.1); color: var(--accent-green); }

.notification-content p {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.notification-time {
  font-size: 11px;
  color: var(--text-tertiary);
}

.dropdown-footer {
  display: block;
  padding: 12px;
  text-align: center;
  font-size: 13px;
  color: var(--accent-blue);
  text-decoration: none;
  border-top: 1px solid var(--glass-border);
  margin-top: 8px;
}

.dropdown-footer:hover {
  background: rgba(0, 0, 0, 0.04);
}

.user-menu-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
}

.user-menu-header .user-avatar {
  width: 40px;
  height: 40px;
}

.user-menu-header .user-name {
  font-size: 14px;
  font-weight: 600;
}

.user-menu-header .user-email {
  font-size: 12px;
  color: var(--text-tertiary);
}

.menu-divider {
  border: none;
  border-top: 1px solid var(--glass-border);
  margin: 8px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  text-decoration: none;
  transition: background var(--transition-fast);
}

.dropdown-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.dropdown-item.danger {
  color: var(--accent-red);
}

.header-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--glass-border);
}

.page-content {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 1023px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
  }

  .main-content {
    margin-left: 0;
  }

  .main-content.sidebar-collapsed {
    margin-left: 0;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .search-wrapper {
    margin: 0 16px;
    max-width: none;
  }

  .page-content {
    padding: 16px;
  }

  .logo-text {
    display: none;
  }
}

@media (max-width: 640px) {
  .top-header {
    padding: 0 12px;
  }

  .header-actions .btn:not(.user-avatar-btn):not(:last-child) {
    display: none;
  }
}
</style>