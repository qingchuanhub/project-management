<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { User, Bell, Moon, Sun, Palette, Shield, Key, Globe, Database, Trash2, Save, Download, Upload } from 'lucide-vue-next'
import { ElForm, ElFormItem, ElInput, ElSwitch, ElSelect, ElOption, ElButton, ElAvatar, ElTabs, ElTabPane, ElTag, ElDivider, ElMessage } from 'element-plus'

const userStore = useUserStore()

const activeTab = ref('profile')
const currentUser = computed(() => userStore.currentUser)

const profileForm = ref({
  name: currentUser.value?.name || '',
  email: currentUser.value?.email || '',
  bio: '',
  timezone: 'Asia/Shanghai',
  language: 'zh-CN'
})

const notificationSettings = ref({
  email: true,
  push: true,
  taskAssigned: true,
  taskUpdated: true,
  comments: true,
  mentions: true,
  weeklyDigest: false
})

const appearanceSettings = ref({
  theme: 'system',
  compactMode: false,
  animations: true
})

const securitySettings = ref({
  twoFactor: false,
  sessionTimeout: 30
})

const integrations = ref([
  { name: 'GitHub', connected: true, icon: 'github' },
  { name: 'GitLab', connected: false, icon: 'gitlab' },
  { name: 'Slack', connected: true, icon: 'message-square' },
  { name: 'Jira', connected: false, icon: 'ticket' },
  { name: 'Figma', connected: false, icon: 'figma' },
  { name: 'Notion', connected: false, icon: 'file-text' }
])

const themes = [
  { value: 'light', label: '浅色', icon: Sun },
  { value: 'dark', label: '深色', icon: Moon },
  { value: 'system', label: '跟随系统', icon: Globe }
]

const languages = [
  { value: 'zh-CN', label: '中文 (简体)' },
  { value: 'en-US', label: 'English' },
  { value: 'ja-JP', label: '日本語' }
]

const timezones = [
  'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Seoul',
  'America/New_York', 'America/Los_Angeles', 'America/Chicago',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Australia/Sydney'
]

function saveProfile() {
  ElMessage.success('个人资料已保存')
}

function saveNotifications() {
  ElMessage.success('通知设置已保存')
}

function saveAppearance() {
  ElMessage.success('外观设置已保存')
  applyTheme(appearanceSettings.value.theme)
}

function applyTheme(theme) {
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark)
  localStorage.setItem('theme', theme)
}

function exportData() {
  ElMessage.info('数据导出功能开发中...')
}

function importData() {
  ElMessage.info('数据导入功能开发中...')
}

function deleteAccount() {
  ElMessage.warning('删除账号功能开发中...')
}
</script>

<template>
  <div class="settings-view">
    <div class="view-header">
      <div>
        <h1>设置</h1>
        <p class="view-subtitle">管理您的账号、偏好设置与集成</p>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="settings-tabs">
      <!-- Profile -->
      <el-tab-pane label="个人资料" name="profile">
        <el-form :model="profileForm" label-width="100px" class="settings-form">
          <el-form-item label="头像">
            <el-avatar :size="80" :src="currentUser?.avatar" class="avatar-preview" />
            <div class="form-hint">点击头像上传新图片</div>
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="profileForm.name" placeholder="输入您的姓名" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="profileForm.email" placeholder="输入邮箱地址" />
          </el-form-item>
          <el-form-item label="个人简介">
            <el-input v-model="profileForm.bio" type="textarea" placeholder="介绍一下您自己" :rows="3" />
          </el-form-item>
          <el-form-item label="时区">
            <el-select v-model="profileForm.timezone" placeholder="选择时区" style="width: 100%;">
              <el-option v-for="tz in timezones" :key="tz" :label="tz" :value="tz" />
            </el-select>
          </el-form-item>
          <el-form-item label="语言">
            <el-select v-model="profileForm.language" placeholder="选择语言" style="width: 100%;">
              <el-option v-for="lang in languages" :key="lang.value" :label="lang.label" :value="lang.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveProfile"><Save size="16" /> 保存更改</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Notifications -->
      <el-tab-pane label="通知" name="notifications">
        <el-form :model="notificationSettings" class="settings-form">
          <div class="settings-section">
            <h3>通知方式</h3>
            <el-form-item label="邮件通知">
              <el-switch v-model="notificationSettings.email" />
            </el-form-item>
            <el-form-item label="推送通知">
              <el-switch v-model="notificationSettings.push" />
            </el-form-item>
          </div>

          <el-divider />

          <div class="settings-section">
            <h3>任务通知</h3>
            <el-form-item label="分配给我的任务">
              <el-switch v-model="notificationSettings.taskAssigned" />
            </el-form-item>
            <el-form-item label="任务状态更新">
              <el-switch v-model="notificationSettings.taskUpdated" />
            </el-form-item>
            <el-form-item label="评论回复">
              <el-switch v-model="notificationSettings.comments" />
            </el-form-item>
            <el-form-item label="@ 提及我">
              <el-switch v-model="notificationSettings.mentions" />
            </el-form-item>
          </div>

          <el-divider />

          <div class="settings-section">
            <h3>汇总报告</h3>
            <el-form-item label="每周汇总邮件">
              <el-switch v-model="notificationSettings.weeklyDigest" />
            </el-form-item>
          </div>

          <el-form-item>
            <el-button type="primary" @click="saveNotifications"><Save size="16" /> 保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Appearance -->
      <el-tab-pane label="外观" name="appearance">
        <el-form :model="appearanceSettings" class="settings-form">
          <div class="settings-section">
            <h3>主题模式</h3>
            <div class="theme-options">
              <label
                v-for="theme in themes"
                :key="theme.value"
                class="theme-option"
                :class="{ active: appearanceSettings.theme === theme.value }"
                @click="appearanceSettings.theme = theme.value"
              >
                <component :is="theme.icon" size="20" />
                <span>{{ theme.label }}</span>
                <el-tag v-if="theme.value === 'system'" size="small" type="info">推荐</el-tag>
              </label>
            </div>
          </div>

          <el-divider />

          <div class="settings-section">
            <h3>界面偏好</h3>
            <el-form-item label="紧凑模式">
              <el-switch v-model="appearanceSettings.compactMode" />
            </el-form-item>
            <el-form-item label="动画效果">
              <el-switch v-model="appearanceSettings.animations" />
            </el-form-item>
          </div>

          <el-form-item>
            <el-button type="primary" @click="saveAppearance"><Save size="16" /> 保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Security -->
      <el-tab-pane label="安全" name="security">
        <el-form :model="securitySettings" class="settings-form">
          <div class="settings-section">
            <h3>账号安全</h3>
            <el-form-item label="两步验证 (2FA)">
              <el-switch v-model="securitySettings.twoFactor" />
              <template #append>
                <el-button size="small" v-if="!securitySettings.twoFactor">启用</el-button>
                <el-button size="small" v-else type="danger">禁用</el-button>
              </template>
            </el-form-item>
            <el-form-item label="会话超时 (分钟)">
              <el-input v-model.number="securitySettings.sessionTimeout" type="number" :min="5" :max="480" style="width: 120px;" />
            </el-form-item>
          </div>

          <el-divider />

          <div class="settings-section danger-zone">
            <h3>危险区域</h3>
            <div class="danger-item">
              <div>
                <h4>删除账号</h4>
                <p>永久删除您的账号及所有数据，此操作不可恢复。</p>
              </div>
              <el-button type="danger" @click="deleteAccount"><Trash2 size="16" /> 删除账号</el-button>
            </div>
          </div>
        </el-form>
      </el-tab-pane>

      <!-- Integrations -->
      <el-tab-pane label="集成" name="integrations">
        <div class="integrations-list">
          <div
            v-for="integration in integrations"
            :key="integration.name"
            class="integration-card glass"
          >
            <div class="integration-info">
              <div class="integration-icon">
                <component :is="integration.icon" size="24" />
              </div>
              <div>
                <h4>{{ integration.name }}</h4>
                <p>{{ integration.connected ? '已连接' : '未连接' }}</p>
              </div>
            </div>
            <el-button
              :type="integration.connected ? 'danger' : 'primary'"
              size="small"
            >
              {{ integration.connected ? '断开连接' : '连接' }}
            </el-button>
          </div>
        </div>
      </el-tab-pane>

      <!-- Data -->
      <el-tab-pane label="数据" name="data">
        <el-form class="settings-form">
          <div class="settings-section">
            <h3>数据管理</h3>
            <div class="data-actions">
              <div class="data-action">
                <div>
                  <h4>导出数据</h4>
                  <p>下载您的所有项目、任务和设置数据 (JSON 格式)</p>
                </div>
                <el-button @click="exportData"><Download size="16" /> 导出</el-button>
              </div>
              <div class="data-action">
                <div>
                  <h4>导入数据</h4>
                  <p>从之前的导出文件恢复数据</p>
                </div>
                <el-button @click="importData"><Upload size="16" /> 导入</el-button>
              </div>
            </div>
          </div>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.settings-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-header {
  margin-bottom: 20px;
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

.settings-tabs {
  flex: 1;
  overflow: auto;
}

.settings-form {
  padding: 24px;
  max-width: 720px;
}

.settings-section {
  margin-bottom: 24px;
}

.settings-section h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--glass-border);
}

.form-hint {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 8px;
}

.avatar-preview {
  border-radius: 50%;
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.avatar-preview:hover {
  transform: scale(1.05);
}

.theme-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border: 2px solid var(--glass-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--bg-secondary);
}

.theme-option:hover {
  border-color: var(--accent-blue);
}

.theme-option.active {
  border-color: var(--accent-blue);
  background: rgba(0, 113, 227, 0.05);
}

.theme-option :global(.el-tag) {
  margin-top: 4px;
}

.danger-zone {
  background: rgba(255, 59, 48, 0.05);
  border: 1px solid rgba(255, 59, 48, 0.1);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.danger-zone h3 {
  color: var(--accent-red);
  border-color: rgba(255, 59, 48, 0.1);
}

.danger-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.danger-item h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--text-primary);
}

.danger-item p {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0;
}

.integrations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  max-width: 720px;
}

.integration-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-radius: var(--radius-lg);
}

.integration-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.integration-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.integration-info h4 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 2px;
}

.integration-info p {
  font-size: 13px;
  color: var(--text-tertiary);
  margin: 0;
}

.data-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.data-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
}

.data-action h4 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px;
}

.data-action p {
  font-size: 13px;
  color: var(--text-tertiary);
  margin: 0;
}

:deep(.el-tabs__nav) {
  border-bottom: 1px solid var(--glass-border);
  margin-bottom: 0;
}

:deep(.el-tabs__item) {
  color: var(--text-secondary);
  font-weight: 500;
}

:deep(.el-tabs__item.is-active) {
  color: var(--accent-blue);
}

:deep(.el-tabs__active-bar) {
  background: var(--accent-blue);
}

@media (max-width: 640px) {
  .settings-form {
    padding: 16px;
  }

  .theme-options {
    grid-template-columns: repeat(2, 1fr);
  }

  .data-action {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .danger-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>