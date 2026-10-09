<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { Clock, AlertTriangle, Flag, MessageSquare, MoreVertical, User } from 'lucide-vue-next'

const props = defineProps({
  task: { type: Object, required: true },
  showProject: { type: Boolean, default: false },
  compact: { type: Boolean, default: false }
})

const emit = defineEmits(['click', 'move', 'menu'])

const userStore = useUserStore()
const assignee = computed(() => userStore.getUser(props.task.assignee))
const isOverdue = computed(() =>
  props.task.dueDate && new Date(props.task.dueDate) < new Date() && props.task.status !== 'done'
)
const priorityColors = {
  high: '#ff3b30',
  medium: '#ff9f0a',
  low: '#30d158'
}
const priorityLabels = { high: '高', medium: '中', low: '低' }
</script>

<template>
  <article
    class="task-card glass"
    :class="{ compact, overdue: isOverdue }"
    draggable="true"
    @dragstart="onDragStart"
    @click="$emit('click', task)"
    @contextmenu.prevent="emit('menu', $event, task)"
  >
    <div class="task-header">
      <div class="task-status-indicator" :style="{ background: statusColors[task.status] }" />
      <div class="task-priority" :style="{ background: priorityColors[task.priority] + '15', color: priorityColors[task.priority] }">
        {{ priorityLabels[task.priority] }}
      </div>
    </div>

    <div class="task-body">
      <h4 class="task-title">{{ task.title }}</h4>
      <p class="task-description" v-if="task.description && !compact">{{ task.description }}</p>

      <div class="task-meta">
        <div class="meta-row">
          <span v-if="task.dueDate" class="meta-item" :class="{ overdue: isOverdue }">
            <Clock size="12" />
            {{ formatDate(task.dueDate) }}
            <AlertTriangle v-if="isOverdue" size="10" class="overdue-icon" />
          </span>
          <span v-if="task.tags?.length" class="meta-item tags">
            <span
              v-for="tag in task.tags.slice(0, 2)"
              :key="tag"
              class="tag"
            >{{ tag }}</span>
            <span v-if="task.tags.length > 2" class="tag more">+{{ task.tags.length - 2 }}</span>
          </span>
        </div>

        <div class="meta-row assignee-row" v-if="assignee">
          <img :src="assignee.avatar" :alt="assignee.name" class="assignee-avatar" />
          <span class="assignee-name">{{ assignee.name }}</span>
        </div>
      </div>
    </div>

    <div class="task-footer" v-if="!compact">
      <div class="task-actions">
        <button class="btn btn-icon btn-ghost" @click.stop="$emit('move', task, 'in-progress')" title="开始处理">
          <Flag size="14" />
        </button>
        <button class="btn btn-icon btn-ghost" @click.stop title="评论">
          <MessageSquare size="14" />
        </button>
      </div>
      <button class="btn btn-icon btn-ghost task-menu" @click.stop="emit('menu', $event, task)">
        <MoreVertical size="14" />
      </button>
    </div>
  </article>
</template>

<style scoped>
.task-card {
  border-radius: var(--radius-lg);
  padding: 16px;
  border: 1px solid var(--glass-border);
  transition: all var(--transition-fast);
  cursor: grab;
}

.task-card:hover {
  box-shadow: var(--shadow-md);
  border-color: rgba(0, 113, 227, 0.2);
}

.task-card.compact {
  padding: 12px;
}

.task-card:active {
  cursor: grabbing;
}

.task-card.overdue {
  border-color: rgba(255, 59, 48, 0.3);
}

.task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.task-status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.task-priority {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.task-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
}

.task-description {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--glass-border);
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-tertiary);
}

.meta-item.overdue {
  color: #ff3b30;
}

.overdue-icon {
  flex-shrink: 0;
}

.tags {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tag {
  font-size: 10px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.tag.more {
  background: transparent;
  color: var(--text-tertiary);
  padding: 0;
}

.assignee-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.assignee-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--bg-primary);
}

.assignee-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.task-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--glass-border);
}

.task-actions {
  display: flex;
  gap: 4px;
}

.task-menu {
  opacity: 0;
  color: var(--text-tertiary);
  transition: opacity var(--transition-fast);
}

.task-card:hover .task-menu {
  opacity: 1;
}

.status-colors {
  --todo: #86868b;
  --in-progress: #0071e3;
  --review: #ff9f0a;
  --done: #30d158;
}
</style>