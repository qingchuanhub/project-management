<script setup>
import { ref, computed } from 'vue'
import { Plus, ChevronDown } from 'lucide-vue-next'
import TaskCard from '@/components/kanban/TaskCard.vue'

const props = defineProps({
  column: { type: Object, required: true },
  tasks: { type: Array, default: () => [] },
  count: { type: Number, default: 0 },
  isDragOver: { type: Boolean, default: false }
})

const emit = defineEmits(['drag-over', 'drag-leave', 'drop', 'add-task'])

const showAllTasks = ref(false)
const visibleTasks = computed(() => showAllTasks.value ? props.tasks : props.tasks.slice(0, 10))

function handleDragOver(event) {
  emit('drag-over', event, props.column.id)
}

function handleDragLeave(event) {
  emit('drag-leave', event, props.column.id)
}

function handleDrop(event) {
  emit('drop', event, props.column.id)
}

function handleAddTask() {
  emit('add-task', props.column.id)
}
</script>

<template>
  <div
    class="kanban-column glass"
    :class="{ 'drag-over': isDragOver }"
    role="list"
    aria-label="{{ column.title }}"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div class="column-header">
      <div class="column-title-wrapper">
        <div
          class="column-color-indicator"
          :style="{ background: column.color }"
        />
        <h3 class="column-title">{{ column.title }}</h3>
        <span class="column-count">{{ count }}</span>
      </div>
      <button
        class="btn btn-icon btn-ghost column-menu"
        @click="handleAddTask"
        aria-label="添加任务到 {{ column.title }}"
      >
        <Plus size="16" />
      </button>
    </div>

    <div class="column-content" role="listbox">
      <TaskCard
        v-for="task in visibleTasks"
        :key="task.id"
        :task="task"
        draggable="true"
        @dragstart="handleDragOver"
        @dragend="handleDragLeave"
        role="option"
      />

      <div
        v-if="props.tasks.length > 10 && !showAllTasks"
        class="load-more"
        @click="showAllTasks = true"
      >
        查看更多 ({{ props.tasks.length - 10 }})
      </div>

      <div
        v-if="visibleTasks.length === 0"
        class="empty-column"
      >
        <p>暂无任务</p>
        <button class="btn btn-ghost btn-sm" @click="handleAddTask">
          <Plus size="14" />
          添加第一个任务
        </button>
      </div>
    </div>

    <button
      v-if="props.tasks.length > 10 && showAllTasks"
      class="btn btn-ghost btn-sm show-less"
      @click="showAllTasks = false"
    >
      <ChevronDown size="14" />
      收起
    </button>
  </div>
</template>

<style scoped>
.kanban-column {
  display: flex;
  flex-direction: column;
  width: 300px;
  min-width: 300px;
  max-height: calc(100vh - 200px);
  border-radius: var(--radius-xl);
  background: var(--glass-bg);
  backdrop-filter: saturate(180%) blur(20px);
  border: 1px solid var(--glass-border);
  transition: all var(--transition-base);
}

.kanban-column.drag-over {
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 2px rgba(0, 113, 227, 0.2);
  background: rgba(0, 113, 227, 0.02);
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--glass-border);
}

.column-title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.column-color-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.column-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.column-count {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  white-space: nowrap;
}

.column-menu {
  color: var(--text-tertiary);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.kanban-column:hover .column-menu {
  opacity: 1;
}

.column-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 200px;
}

.column-content::-webkit-scrollbar {
  width: 4px;
}

.column-content::-webkit-scrollbar-track {
  background: transparent;
}

.column-content::-webkit-scrollbar-thumb {
  background: var(--text-tertiary);
  border-radius: 2px;
  opacity: 0.3;
}

.empty-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: var(--text-tertiary);
  text-align: center;
  gap: 12px;
  flex: 1;
}

.load-more,
.show-less {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  color: var(--accent-blue);
  font-size: 13px;
  font-weight: 500;
  background: rgba(0, 113, 227, 0.04);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.load-more:hover,
.show-less:hover {
  background: rgba(0, 113, 227, 0.08);
}

.show-less {
  margin-top: 8px;
}
</style>