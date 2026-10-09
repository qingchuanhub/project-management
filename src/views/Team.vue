<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useProjectStore } from '@/stores/project'
import { Plus, Search, Mail, MessageSquare, MoreVertical, UserPlus, Settings } from 'lucide-vue-next'
import { ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElAvatar, ElTag, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'

const userStore = useUserStore()
const projectStore = useProjectStore()

const searchQuery = ref('')
const viewMode = ref('grid')
const showInviteDialog = ref(false)
const inviteForm = ref({ email: '', role: 'member', projects: [] })

const filteredUsers = computed(() => {
  if (!searchQuery.value) return userStore.users
  const query = searchQuery.value.toLowerCase()
  return userStore.users.filter(u =>
    u.name.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query)
  )
})

const roles = [
  { value: 'admin', label: '管理员' },
  { value: 'member', label: '成员' },
  { value: 'viewer', label: '查看者' }
]

const statusColors = {
  online: '#30d158',
  away: '#ff9f0a',
  busy: '#ff3b30',
  offline: '#86868b'
}

const statusLabels = {
  online: '在线',
  away: '离开',
  busy: '忙碌',
  offline: '离线'
}

function inviteMember() {
  showInviteDialog.value = true
}

function sendInvite() {
  showInviteDialog.value = false
}

function getUserProjects(userId) {
  return projectStore.projects.filter(p => p.members.includes(userId))
}
</script>

<template>
  <div class="team-view">
    <div class="view-header">
      <div>
        <h1>团队</h1>
        <p class="view-subtitle">管理团队成员与协作</p>
      </div>
      <div class="header-actions">
        <div class="search-wrapper">
          <Search size="18" class="search-icon" />
          <input
            type="search"
            class="search-input input"
            placeholder="搜索成员..."
            v-model="searchQuery"
          />
        </div>
        <div class="view-toggle" role="group">
          <button class="btn btn-icon" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'"><UserPlus size="18" /></button>
          <button class="btn btn-icon" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'"><Settings size="18" /></button>
        </div>
        <button class="btn btn-primary" @click="inviteMember">
          <Plus size="16" />
          邀请成员
        </button>
      </div>
    </div>

    <!-- Grid View -->
    <div v-show="viewMode === 'grid'" class="team-grid">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="member-card glass"
      >
        <el-avatar :size="60" :src="user.avatar" class="member-avatar" />
        <div class="member-info">
          <h3>{{ user.name }}</h3>
          <p class="member-email">{{ user.email }}</p>
          <div class="member-meta">
            <el-tag :type="user.role === 'admin' ? 'danger' : 'info'" size="small">{{ user.role }}</el-tag>
            <span class="status-indicator" :style="{ background: statusColors[user.status] }" />
            <span class="status-text">{{ statusLabels[user.status] }}</span>
          </div>
        </div>
        <div class="member-projects">
          <span class="project-count">{{ getUserProjects(user.id).length }} 个项目</span>
          <el-dropdown>
            <button class="btn btn-icon btn-ghost"><MoreVertical size="16" /></button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item><MessageSquare size="14" /> 发送消息</el-dropdown-item>
                <el-dropdown-item><Settings size="14" /> 编辑权限</el-dropdown-item>
                <el-dropdown-item divided class="danger"><UserPlus size="14" /> 移出团队</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-show="viewMode === 'list'" class="team-list glass">
      <table class="members-table">
        <thead>
          <tr>
            <th>成员</th>
            <th>角色</th>
            <th>状态</th>
            <th>项目</th>
            <th>加入时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>
              <div class="user-cell">
                <el-avatar :size="36" :src="user.avatar" />
                <div>
                  <p class="user-name">{{ user.name }}</p>
                  <p class="user-email">{{ user.email }}</p>
                </div>
              </div>
            </td>
            <td><el-tag :type="user.role === 'admin' ? 'danger' : 'info'" size="small">{{ user.role }}</el-tag></td>
            <td>
              <div class="status-cell">
                <span class="status-dot" :style="{ background: statusColors[user.status] }" />
                {{ statusLabels[user.status] }}
              </div>
            </td>
            <td>{{ getUserProjects(user.id).length }}</td>
            <td>2024-01-15</td>
            <td>
              <el-dropdown>
                <button class="btn btn-icon btn-ghost"><MoreVertical size="16" /></button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item><MessageSquare size="14" /> 发送消息</el-dropdown-item>
                    <el-dropdown-item><Settings size="14" /> 编辑权限</el-dropdown-item>
                    <el-dropdown-item divided class="danger"><UserPlus size="14" /> 移出团队</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Invite Dialog -->
    <el-dialog
      v-model="showInviteDialog"
      title="邀请新成员"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="inviteForm" label-width="80px">
        <el-form-item label="邮箱">
          <el-input v-model="inviteForm.email" placeholder="输入邮箱地址" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="inviteForm.role" placeholder="选择角色">
            <el-option v-for="r in roles" :key="r.value" :label="r.label" :value="r.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目">
          <el-select v-model="inviteForm.projects" multiple placeholder="选择项目" style="width: 100%;">
            <el-option
              v-for="p in projectStore.projects"
              :key="p.id"
              :label="p.name"
              :value="p.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInviteDialog = false">取消</el-button>
        <el-button type="primary" @click="sendInvite">发送邀请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.team-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.view-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.view-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 4px 0 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  width: 280px;
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
}

.team-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.member-card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: var(--radius-xl);
  gap: 16px;
}

.member-avatar {
  align-self: flex-start;
}

.member-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px;
}

.member-email {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 12px;
}

.member-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-text {
  font-size: 12px;
  color: var(--text-tertiary);
}

.member-projects {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--glass-border);
}

.project-count {
  font-size: 13px;
  color: var(--text-secondary);
}

.team-list {
  flex: 1;
  overflow: auto;
  border-radius: var(--radius-xl);
}

.members-table {
  width: 100%;
  border-collapse: collapse;
}

.members-table th,
.members-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid var(--glass-border);
}

.members-table th {
  font-weight: 600;
  color: var(--text-tertiary);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--bg-tertiary);
}

.members-table tbody tr:hover {
  background: rgba(0, 0, 0, 0.02);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-weight: 500;
  margin: 0;
}

.user-email {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0;
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

@media (max-width: 640px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-wrapper {
    width: 100%;
  }

  .team-grid {
    grid-template-columns: 1fr;
  }
}
</style>