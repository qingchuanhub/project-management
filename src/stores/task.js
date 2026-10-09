import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref([
    {
      id: '1',
      title: 'Design new dashboard layout',
      description: 'Create wireframes and high-fidelity mockups for the new dashboard',
      status: 'todo',
      priority: 'high',
      assignee: '1',
      projectId: '1',
      tags: ['design', 'ui'],
      dueDate: '2024-02-15',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-25',
      order: 0
    },
    {
      id: '2',
      title: 'Implement authentication flow',
      description: 'OAuth2 integration with Google and GitHub providers',
      status: 'in-progress',
      priority: 'high',
      assignee: '2',
      projectId: '1',
      tags: ['backend', 'auth'],
      dueDate: '2024-02-20',
      createdAt: '2024-01-22',
      updatedAt: '2024-01-28',
      order: 0
    },
    {
      id: '3',
      title: 'Write API documentation',
      description: 'Document all REST endpoints with OpenAPI spec',
      status: 'review',
      priority: 'medium',
      assignee: '3',
      projectId: '1',
      tags: ['docs', 'api'],
      dueDate: '2024-02-10',
      createdAt: '2024-01-25',
      updatedAt: '2024-02-01',
      order: 0
    },
    {
      id: '4',
      title: 'Setup CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment',
      status: 'done',
      priority: 'medium',
      assignee: '1',
      projectId: '1',
      tags: ['devops', 'ci-cd'],
      dueDate: '2024-01-30',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-29',
      order: 0
    },
    {
      id: '5',
      title: 'Mobile app onboarding flow',
      description: 'Design and implement new user onboarding screens',
      status: 'todo',
      priority: 'high',
      assignee: '4',
      projectId: '2',
      tags: ['mobile', 'design'],
      dueDate: '2024-03-15',
      createdAt: '2024-03-01',
      updatedAt: '2024-03-01',
      order: 0
    },
    {
      id: '6',
      title: 'Push notification service',
      description: 'Integrate Firebase Cloud Messaging for push notifications',
      status: 'todo',
      priority: 'medium',
      assignee: '2',
      projectId: '2',
      tags: ['mobile', 'backend'],
      dueDate: '2024-04-01',
      createdAt: '2024-03-05',
      updatedAt: '2024-03-05',
      order: 1
    },
    {
      id: '7',
      title: 'Service mesh configuration',
      description: 'Configure Istio for traffic management and observability',
      status: 'in-progress',
      priority: 'high',
      assignee: '5',
      projectId: '3',
      tags: ['backend', 'devops'],
      dueDate: '2024-03-01',
      createdAt: '2024-02-10',
      updatedAt: '2024-02-20',
      order: 0
    },
    {
      id: '8',
      title: 'Rate limiting implementation',
      description: 'Add distributed rate limiting with Redis',
      status: 'todo',
      priority: 'medium',
      assignee: '1',
      projectId: '3',
      tags: ['backend', 'security'],
      dueDate: '2024-03-15',
      createdAt: '2024-02-15',
      updatedAt: '2024-02-15',
      order: 1
    },
    {
      id: '9',
      title: 'Distributed tracing setup',
      description: 'Integrate Jaeger for request tracing across services',
      status: 'review',
      priority: 'medium',
      assignee: '3',
      projectId: '3',
      tags: ['backend', 'observability'],
      dueDate: '2024-03-20',
      createdAt: '2024-02-20',
      updatedAt: '2024-03-01',
      order: 2
    },
    {
      id: '10',
      title: 'Color palette design tokens',
      description: 'Define semantic color tokens for light/dark modes',
      status: 'done',
      priority: 'high',
      assignee: '4',
      projectId: '4',
      tags: ['design', 'design-system'],
      dueDate: '2023-12-01',
      createdAt: '2023-11-15',
      updatedAt: '2023-12-01',
      order: 0
    },
    {
      id: '11',
      title: 'Component library v1.0',
      description: 'Build and document core React component library',
      status: 'done',
      priority: 'high',
      assignee: '2',
      projectId: '4',
      tags: ['frontend', 'design-system'],
      dueDate: '2024-01-15',
      createdAt: '2023-12-01',
      updatedAt: '2024-01-15',
      order: 1
    }
  ])

  const columns = ref([
    { id: 'todo', title: '待办', color: '#86868b' },
    { id: 'in-progress', title: '进行中', color: '#0071e3' },
    { id: 'review', title: '代码审查', color: '#ff9f0a' },
    { id: 'done', title: '已完成', color: '#30d158' }
  ])

  const currentProjectId = ref('1')

  const projectTasks = computed(() =>
    tasks.value.filter(t => t.projectId === currentProjectId.value)
  )

  const tasksByColumn = computed(() => {
    const grouped = {}
    columns.value.forEach(col => {
      grouped[col.id] = projectTasks.value
        .filter(t => t.status === col.id)
        .sort((a, b) => a.order - b.order)
    })
    return grouped
  })

  const taskCounts = computed(() => {
    const counts = {}
    columns.value.forEach(col => {
      counts[col.id] = projectTasks.value.filter(t => t.status === col.id).length
    })
    return counts
  })

  function setProject(projectId) {
    currentProjectId.value = projectId
  }

  function addTask(task) {
    const maxOrder = Math.max(
      ...projectTasks.value
        .filter(t => t.status === task.status)
        .map(t => t.order),
      -1
    )
    tasks.value.push({
      ...task,
      id: Date.now().toString(),
      order: maxOrder + 1,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    })
  }

  function updateTask(id, updates) {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks.value[index] = {
        ...tasks.value[index],
        ...updates,
        updatedAt: new Date().toISOString().split('T')[0]
      }
    }
  }

  function moveTask(taskId, newStatus, newOrder) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return

    const oldStatus = task.status
    const oldOrder = task.order

    if (oldStatus === newStatus) {
      const columnTasks = tasks.value
        .filter(t => t.status === newStatus && t.projectId === currentProjectId.value)
        .sort((a, b) => a.order - b.order)

      columnTasks.forEach((t, index) => {
        if (t.id === taskId) {
          updateTask(t.id, { order: newOrder })
        } else if (oldOrder < newOrder && t.order > oldOrder && t.order <= newOrder) {
          updateTask(t.id, { order: t.order - 1 })
        } else if (oldOrder > newOrder && t.order >= newOrder && t.order < oldOrder) {
          updateTask(t.id, { order: t.order + 1 })
        }
      })
    } else {
      const newColumnTasks = tasks.value
        .filter(t => t.status === newStatus && t.projectId === currentProjectId.value)
        .sort((a, b) => a.order - b.order)

      newColumnTasks.forEach((t, index) => {
        if (index >= newOrder) {
          updateTask(t.id, { order: t.order + 1 })
        }
      })

      const oldColumnTasks = tasks.value
        .filter(t => t.status === oldStatus && t.projectId === currentProjectId.value)
        .sort((a, b) => a.order - b.order)

      oldColumnTasks.forEach((t, index) => {
        if (t.order > oldOrder) {
          updateTask(t.id, { order: t.order - 1 })
        }
      })

      updateTask(taskId, { status: newStatus, order: newOrder })
    }
  }

  function deleteTask(id) {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return

    const columnTasks = tasks.value
      .filter(t => t.status === task.status && t.projectId === currentProjectId.value)
      .sort((a, b) => a.order - b.order)

    columnTasks.forEach(t => {
      if (t.order > task.order) {
        updateTask(t.id, { order: t.order - 1 })
      }
    })

    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  return {
    tasks,
    columns,
    currentProjectId,
    projectTasks,
    tasksByColumn,
    taskCounts,
    setProject,
    addTask,
    updateTask,
    moveTask,
    deleteTask
  }
})