<script setup>
import { computed } from 'vue'
import { Users, Clock, CheckCircle, MoreVertical } from 'lucide-vue-next'

const props = defineProps({
  project: { type: Object, required: true },
  compact: { type: Boolean, default: false }
})

const emit = defineEmits(['click', 'menu'])

const progressColor = computed(() => props.project.color || '#0071e3')
const memberAvatars = computed(() => props.project.members?.slice(0, 4) || [])
const remainingMembers = computed(() => Math.max(0, (props.project.members?.length || 0) - 4))
</script>

<template>
  <article
    class="project-card glass"
    :class="{ compact }"
    @click="$emit('click')"
    @contextmenu.prevent="emit('menu', $event, project)"
  >
    <div class="project-header">
      <div class="project-icon" :style="{ background: progressColor + '15', color: progressColor }">
        <component :is="project.icon" size="20" v-if="typeof project.icon === 'object'" />
        <span v-else class="icon-emoji">{{ project.icon }}</span>
      </div>
      <div class="project-status" :class="project.status">
        <span>{{ statusLabels[project.status] }}</span>
      </div>
    </div>

    <div class="project-body">
      <h3 class="project-name">{{ project.name }}</h3>
      <p class="project-description" v-if="!compact">{{ project.description }}</p>

      <div class="project-progress" v-if="!compact">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: project.progress + '%', background: progressColor }"
            role="progressbar"
            :aria-valuenow="project.progress"
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
        <span class="progress-text">{{ project.progress }}% 完成</span>
      </div>

      <div class="project-meta">
        <div class="meta-item">
          <Clock size="14" />
          <span>{{ formatDate(project.endDate) }}</span>
        </div>
        <div class="meta-item members">
          <Users size="14" />
          <div class="avatar-stack">
            <img
              v-for="(memberId, index) in memberAvatars"
              :key="memberId"
              :src="getAvatar(memberId)"
              :alt="getName(memberId)"
              class="avatar"
              :style="{ zIndex: memberAvatars.length - index }"
            />
            <span v-if="remainingMembers > 0" class="avatar more">+{{ remainingMembers }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="project-footer" v-if="!compact">
      <div class="project-tags">
        <span
          v-for="tag in project.tags?.slice(0, 3) || []"
          :key="tag"
          class="tag"
        >{{ tag }}</span>
      </div>
      <button class="btn btn-icon btn-ghost project-menu" @click.stop="emit('menu', $event, project)">
        <MoreVertical size="16" />
      </button>
    </div>
  </article>
</template>

<style scoped>
.project-card {
  border-radius: var(--radius-xl);
  padding: 20px;
  transition: all var(--transition-base);
  cursor: pointer;
  border: 1px solid var(--glass-border);
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: rgba(0, 113, 227, 0.2);
}

.project-card.compact {
  padding: 16px;
}

.project-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.project-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.icon-emoji {
  font-size: 20px;
}

.project-status {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: capitalize;
}

.project-status.active {
  background: rgba(48, 209, 88, 0.1);
  color: #30d158;
}

.project-status.planning {
  background: rgba(255, 159, 10, 0.1);
  color: #ff9f0a;
}

.project-status.completed {
  background: rgba(191, 90, 242, 0.1);
  color: #bf5af2;
}

.project-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.project-description {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-bar {
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease-out;
}

.progress-text {
  font-size: 12px;
  color: var(--text-tertiary);
}

.project-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid var(--glass-border);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.members .avatar-stack {
  display: flex;
  margin-left: -8px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--bg-primary);
  margin-left: -8px;
  transition: transform var(--transition-fast);
}

.avatar:first-child {
  margin-left: 0;
}

.avatar:hover {
  transform: scale(1.1);
  z-index: 10 !important;
}

.avatar.more {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-primary);
  margin-left: -8px;
}

.project-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--glass-border);
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.project-menu {
  opacity: 0;
  color: var(--text-tertiary);
  transition: opacity var(--transition-fast);
}

.project-card:hover .project-menu {
  opacity: 1;
}
</style>