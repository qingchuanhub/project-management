<script setup>
import { ref, computed, watch } from 'vue'
import {
  User, Bell, Palette, Shield, Database, Save, Download, Trash2, Check
} from 'lucide-vue-next'
import { useAuthStore } from '../store'

const auth = useAuthStore()
const me = computed(() => auth.session || { name: '未登录', email: '', avatar: '' })

const tab = ref('profile')
const tabs = [
  { id: 'profile', label: '个人资料', icon: User },
  { id: 'notify', label: '通知', icon: Bell },
  { id: 'appearance', label: '外观', icon: Palette },
  { id: 'security', label: '安全', icon: Shield },
  { id: 'data', label: '数据', icon: Database }
]

const profile = ref({
  name: (auth.session && auth.session.name) || '林青川',
  email: (auth.session && auth.session.email) || 'qingchuan@team.com',
  bio: '产品与工程的交叉点，热爱构建优雅的界面。',
  timezone: 'Asia/Shanghai (UTC+8)'
})

const notify = ref({
  taskAssigned: true,
  taskUpdated: true,
  comments: true,
  weekly: false,
  sound: true
})

const appearance = ref({
  theme: localStorage.getItem('theme') === 'dark' ? 'dark' : 'light',
  motion: true,
  compact: false
})

watch(
  () => appearance.value.theme,
  (v) => {
    const dark = v === 'dark' || (v === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  },
  { immediate: true }
)

const security = ref({ twofa: false, timeout: 60 })

const toast = ref('')
function save(msg) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2200)
}
</script>

<template>
  <div>
    <div class="head">
      <div>
        <h1>设置</h1>
        <p class="sub">管理账号、偏好与数据</p>
      </div>
      <transition name="fade">
        <span v-if="toast" class="toast"><Check :size="15" /> {{ toast }}</span>
      </transition>
    </div>

    <div class="layout">
      <nav class="tabs glass">
        <button
          v-for="t in tabs"
          :key="t.id"
          class="tab"
          :class="{ on: tab === t.id }"
          @click="tab = t.id"
        >
          <component :is="t.icon" :size="17" />
          {{ t.label }}
        </button>
      </nav>

      <div class="content glass">
        <!-- 个人资料 -->
        <template v-if="tab === 'profile'">
          <div class="sec">
            <h3>个人资料</h3>
            <div class="ava-row">
              <img :src="me?.avatar" :alt="me?.name" class="big-ava" />
              <div>
                <button class="btn btn-secondary btn-sm">更换头像</button>
                <p class="hint">JPG / PNG，最大 2MB</p>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>姓名</label>
                <input v-model="profile.name" class="input" />
              </div>
              <div class="form-group">
                <label>邮箱</label>
                <input v-model="profile.email" class="input" />
              </div>
            </div>
            <div class="form-group">
              <label>个人简介</label>
              <textarea v-model="profile.bio" class="input" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>时区</label>
              <select v-model="profile.timezone" class="input">
                <option>Asia/Shanghai (UTC+8)</option>
                <option>Asia/Tokyo (UTC+9)</option>
                <option>America/New_York (UTC-5)</option>
                <option>Europe/London (UTC+0)</option>
              </select>
            </div>
            <button class="btn btn-primary" @click="save('个人资料已保存')"><Save :size="15" /> 保存更改</button>
          </div>
        </template>

        <!-- 通知 -->
        <template v-if="tab === 'notify'">
          <div class="sec">
            <h3>通知偏好</h3>
            <div class="switch-row" v-for="(v, k, i) in notify" :key="k">
              <div>
                <b>{{ ['任务分配给我', '任务状态更新', '评论与回复', '每周汇总邮件', '提示音'][i] }}</b>
                <small>{{ ['有人把任务指派给你时提醒', '任务进度变化时提醒', '有人回复你时提醒', '每周一发送进度报告', '播放轻提示音'][i] }}</small>
              </div>
              <button class="switch" :class="{ on: v }" @click="notify[k] = !v"><i></i></button>
            </div>
            <button class="btn btn-primary" @click="save('通知设置已保存')"><Save :size="15" /> 保存设置</button>
          </div>
        </template>

        <!-- 外观 -->
        <template v-if="tab === 'appearance'">
          <div class="sec">
            <h3>主题</h3>
            <div class="theme-grid">
              <button class="theme-card" :class="{ on: appearance.theme === 'light' }" @click="appearance.theme = 'light'">
                <i class="prev light"></i>
                <span>浅色</span>
                <Check v-if="appearance.theme === 'light'" :size="15" class="chk" />
              </button>
              <button class="theme-card" :class="{ on: appearance.theme === 'dark' }" @click="appearance.theme = 'dark'">
                <i class="prev dark"></i>
                <span>深色</span>
                <Check v-if="appearance.theme === 'dark'" :size="15" class="chk" />
              </button>
              <button class="theme-card" :class="{ on: appearance.theme === 'system' }" @click="appearance.theme = 'system'">
                <i class="prev system"></i>
                <span>跟随系统</span>
                <Check v-if="appearance.theme === 'system'" :size="15" class="chk" />
              </button>
            </div>
            <h3 style="margin-top: 26px">界面</h3>
            <div class="switch-row" v-for="(v, k, i) in { motion: appearance.motion, compact: appearance.compact }" :key="k">
              <div>
                <b>{{ ['动画效果', '紧凑模式'][i] }}</b>
                <small>{{ ['启用过渡与微动效', '减小间距以显示更多内容'][i] }}</small>
              </div>
              <button class="switch" :class="{ on: v }" @click="appearance[k] = !v"><i></i></button>
            </div>
            <button class="btn btn-primary" @click="save('外观设置已保存')"><Save :size="15" /> 保存设置</button>
          </div>
        </template>

        <!-- 安全 -->
        <template v-if="tab === 'security'">
          <div class="sec">
            <h3>账号安全</h3>
            <div class="switch-row">
              <div>
                <b>两步验证 (2FA)</b>
                <small>登录时需要额外验证码，更安全</small>
              </div>
              <button class="switch" :class="{ on: security.twofa }" @click="security.twofa = !security.twofa"><i></i></button>
            </div>
            <div class="form-group" style="max-width: 240px">
              <label>会话超时（分钟）</label>
              <input v-model.number="security.timeout" type="number" min="5" class="input" />
            </div>
            <button class="btn btn-primary" @click="save('安全设置已保存')"><Save :size="15" /> 保存设置</button>

            <div class="danger">
              <div>
                <b>删除账号</b>
                <small>永久删除账号与全部数据，不可恢复</small>
              </div>
              <button class="btn btn-danger btn-sm" @click="save('演示环境不可删除')"><Trash2 :size="14" /> 删除账号</button>
            </div>
          </div>
        </template>

        <!-- 数据 -->
        <template v-if="tab === 'data'">
          <div class="sec">
            <h3>数据管理</h3>
            <div class="data-row">
              <div>
                <b>导出数据</b>
                <small>下载全部项目、任务与设置（JSON）</small>
              </div>
              <button class="btn btn-secondary btn-sm" @click="save('已生成导出文件')"><Download :size="14" /> 导出</button>
            </div>
            <div class="data-row">
              <div>
                <b>导入数据</b>
                <small>从之前的导出文件恢复</small>
              </div>
              <button class="btn btn-secondary btn-sm" @click="save('请选择 JSON 文件')"><Download :size="14" style="transform: rotate(180deg)" /> 导入</button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}
h1 { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
.sub { font-size: 13px; color: var(--text-2); margin-top: 3px; }
.toast {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 600;
  color: #248a3d;
  background: rgba(48, 209, 88, 0.16);
  padding: 9px 16px;
  border-radius: 100px;
}
.dark .toast { color: var(--green); }
.layout { display: grid; grid-template-columns: 220px 1fr; gap: 16px; align-items: start; }
.tabs {
  border-radius: var(--r-xl);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  position: sticky;
  top: 0;
}
.tab {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  background: none;
  border: none;
  border-radius: var(--r-md);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-2);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}
.tab:hover { background: var(--bg-input); color: var(--text); }
.tab.on { background: var(--blue); color: #fff; }
.content { border-radius: var(--r-xl); padding: 26px; }
.sec h3 {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-glass);
}
.sec .btn-primary { margin-top: 8px; }
.ava-row { display: flex; align-items: center; gap: 18px; margin-bottom: 22px; }
.big-ava { width: 74px; height: 74px; border-radius: 50%; background: var(--bg-soft); }
.hint { font-size: 11px; color: var(--text-3); margin-top: 6px; }
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 15px 0;
  border-bottom: 1px solid var(--border-glass);
}
.switch-row b { font-size: 14px; display: block; }
.switch-row small { font-size: 12px; color: var(--text-3); }
.switch {
  width: 46px;
  height: 27px;
  background: var(--border);
  border: none;
  border-radius: 100px;
  cursor: pointer;
  padding: 2px;
  transition: background 0.2s;
  flex-shrink: 0;
}
.switch i {
  display: block;
  width: 23px;
  height: 23px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: var(--shadow-sm);
}
.switch.on { background: var(--green); }
.switch.on i { transform: translateX(19px); }
.theme-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.theme-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px;
  background: var(--bg-input);
  border: 2px solid transparent;
  border-radius: var(--r-md);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  transition: all 0.16s;
}
.theme-card.on { border-color: var(--blue); background: rgba(0, 113, 227, 0.07); }
.chk { position: absolute; top: 8px; right: 8px; color: var(--blue); }
.prev {
  width: 100%;
  height: 54px;
  border-radius: 9px;
  border: 1px solid var(--border);
}
.prev.light { background: linear-gradient(135deg, #fff 50%, #f5f5f7 50%); }
.prev.dark { background: linear-gradient(135deg, #1c1c1e 50%, #000 50%); }
.prev.system { background: linear-gradient(135deg, #fff 50%, #1c1c1e 50%); }
.danger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 28px;
  padding: 18px;
  background: rgba(255, 69, 58, 0.07);
  border: 1px solid rgba(255, 69, 58, 0.2);
  border-radius: var(--r-md);
}
.danger b { font-size: 14px; display: block; color: var(--red); }
.danger small { font-size: 12px; color: var(--text-3); }
.data-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  background: var(--bg-input);
  border-radius: var(--r-md);
  margin-bottom: 12px;
}
.data-row b { font-size: 14px; display: block; }
.data-row small { font-size: 12px; color: var(--text-3); }
@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  .tabs { flex-direction: row; overflow-x: auto; position: static; }
  .theme-grid { grid-template-columns: 1fr; }
}
</style>
