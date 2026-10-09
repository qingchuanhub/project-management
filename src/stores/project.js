import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProjectStore = defineStore('project', () => {
  const projects = ref([
    {
      id: '1',
      name: 'Project Alpha',
      description: 'Main product redesign initiative',
      status: 'active',
      progress: 65,
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      members: ['1', '2', '3'],
      tasks: ['1', '2', '3', '4'],
      color: '#0071e3',
      icon: 'rocket'
    },
    {
      id: '2',
      name: 'Mobile App v2.0',
      description: 'Complete rewrite of mobile application',
      status: 'planning',
      progress: 15,
      startDate: '2024-03-01',
      endDate: '2024-09-15',
      members: ['2', '4'],
      tasks: ['5', '6'],
      color: '#30d158',
      icon: 'smartphone'
    },
    {
      id: '3',
      name: 'API Gateway Migration',
      description: 'Migrate to new microservices architecture',
      status: 'active',
      progress: 40,
      startDate: '2024-02-01',
      endDate: '2024-05-31',
      members: ['1', '3', '5'],
      tasks: ['7', '8', '9'],
      color: '#ff9f0a',
      icon: 'server'
    },
    {
      id: '4',
      name: 'Design System',
      description: 'Unified design system for all products',
      status: 'completed',
      progress: 100,
      startDate: '2023-11-01',
      endDate: '2024-02-28',
      members: ['2', '4'],
      tasks: ['10', '11'],
      color: '#bf5af2',
      icon: 'palette'
    }
  ])

  const activeProjectId = ref('1')

  const activeProject = computed(() =>
    projects.value.find(p => p.id === activeProjectId.value)
  )

  const activeProjects = computed(() =>
    projects.value.filter(p => p.status === 'active')
  )

  const completedProjects = computed(() =>
    projects.value.filter(p => p.status === 'completed')
  )

  const planningProjects = computed(() =>
    projects.value.filter(p => p.status === 'planning')
  )

  function setActiveProject(id) {
    activeProjectId.value = id
  }

  function addProject(project) {
    projects.value.push({
      ...project,
      id: Date.now().toString(),
      progress: 0,
      tasks: [],
      members: []
    })
  }

  function updateProject(id, updates) {
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value[index] = { ...projects.value[index], ...updates }
    }
  }

  function deleteProject(id) {
    projects.value = projects.value.filter(p => p.id !== id)
    if (activeProjectId.value === id) {
      activeProjectId.value = projects.value[0]?.id || null
    }
  }

  return {
    projects,
    activeProjectId,
    activeProject,
    activeProjects,
    completedProjects,
    planningProjects,
    setActiveProject,
    addProject,
    updateProject,
    deleteProject
  }
})