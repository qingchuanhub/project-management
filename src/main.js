import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { detectServer, isServerMode, getToken, api } from './api'
import { useAuthStore, useUsersStore, useProjectsStore, useTasksStore } from './store'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

async function boot() {
  await detectServer()
  const auth = useAuthStore(pinia)

  if (isServerMode() && getToken()) {
    try {
      const d = await api('/bootstrap')
      useUsersStore(pinia).hydrate(d.users)
      useProjectsStore(pinia).hydrate(d.projects)
      useTasksStore(pinia).hydrate(d.tasks)
    } catch (e) {
      console.warn('bootstrap failed', e)
    }
  } else if (isServerMode() && auth.session) {
    // 有会话但没 token（旧版 localStorage 登录）→ 强制重新登录
    auth.logout()
  }

  app.mount('#app')
}

boot()
