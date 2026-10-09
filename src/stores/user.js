import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const users = ref([
    {
      id: '1',
      name: 'Alex Chen',
      email: 'alex@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      role: 'admin',
      status: 'online',
      skills: ['Vue', 'React', 'Node.js', 'Design'],
      projects: ['1', '3']
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      role: 'member',
      status: 'online',
      skills: ['React Native', 'TypeScript', 'Firebase'],
      projects: ['1', '2']
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      email: 'mike@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      role: 'member',
      status: 'away',
      skills: ['Go', 'Kubernetes', 'PostgreSQL'],
      projects: ['1', '3']
    },
    {
      id: '4',
      name: 'Emily Park',
      email: 'emily@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
      role: 'member',
      status: 'offline',
      skills: ['Figma', 'UI/UX', 'Design Systems'],
      projects: ['2', '4']
    },
    {
      id: '5',
      name: 'David Kim',
      email: 'david@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
      role: 'member',
      status: 'busy',
      skills: ['Rust', 'WebAssembly', 'Performance'],
      projects: ['3']
    }
  ])

  const currentUserId = ref('1')

  const currentUser = computed(() =>
    users.value.find(u => u.id === currentUserId.value)
  )

  const onlineUsers = computed(() =>
    users.value.filter(u => u.status === 'online')
  )

  const projectMembers = computed(() => (projectId) =>
    users.value.filter(u => u.projects.includes(projectId))
  )

  function getUser(id) {
    return users.value.find(u => u.id === id)
  }

  function getUsers(ids) {
    return users.value.filter(u => ids.includes(u.id))
  }

  function updateStatus(userId, status) {
    const user = users.value.find(u => u.id === userId)
    if (user) user.status = status
  }

  return {
    users,
    currentUserId,
    currentUser,
    onlineUsers,
    projectMembers,
    getUser,
    getUsers,
    updateStatus
  }
})