<script setup>
import { ref, computed } from 'vue'
import { Search, Plus, Mail, MessageSquare, MoreHorizontal, UserPlus } from 'lucide-vue-next'
import Modal from '../components/Modal.vue'
import { useUsersStore, useProjectsStore } from '../store'

const usersStore = useUsersStore()
const projects = useProjectsStore()

const q = ref('')
const view = ref('grid')
const showInvite = ref(false)
const invite = ref({ email: '', role: 'member', projects: [] })

const statusMap = {
  online: { text: '在线', color: '#30d158' },
  away: { text: '离开', color: '#ff9f0a' },
  busy: { text: '忙碌', color: '#ff453a' },
  offline: { text: '离线', color: '#86868b' }
}

const list = computed(() => {
  if (!q.value.trim()) return usersStore.users
  const s = q.value.toLowerCase()
  return usersStore.users.filter((u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s))
})

const roleText = (r) => (r === 'admin' ? '管理员' : '成员')
const roleCls = (r) => (r === 'admin' ? 'tag-red' : 'tag-blue')

function projCount(uid) {
  return projects.projects.filter((p) => p.members.includes(uid)).length
}
</script>

<template>
  <div>
    <div class="head">
      <div>
        <h1>团队</h1>
        <p class="sub">{{ list.length }} 位成员 · 协作与权限管理</p>
      </div>
      <div class="acts">
        <div class="search">
          <Search :size="15" />
          <input v-model="q" class="input" placeholder="搜索成员…" />
        </div>
        <div class="toggle">
          <button class="btn btn-icon btn-ghost" :class="{ on: view === 'grid' }" @click="view = 'grid'">
            <UserPlus :size="17" />
          </button>
          <button class="btn btn-icon btn-ghost" :class="{ on: view === 'list' }" @click="view = 'list'">
            <MoreHorizontal :size="17" />
          </button>
        </div>
        <button class="btn btn-primary" @click="showInvite = true">
          <Plus :size="16" /> 邀请成员
        </button>
      </div>
    </div>

    <!-- 网格视图 -->
    <div v-if="view === 'grid'" class="grid">
      <div v-for="u in list" :key="u.id" class="mcard glass">
        <div class="m-top">
          <img :src="u.avatar" :alt="u.name" class="ava" />
          <span class="status" :style="{ background: statusMap[u.status].color }" :title="statusMap[u.status].text"></span>
        </div>
        <h3>{{ u.name }}</h3>
        <p class="mail">{{ u.email }}</p>
        <div class="m-tags">
          <span class="tag" :class="roleCls(u.role)">{{ roleText(u.role) }}</span>
          <span class="tag">{{ projCount(u.id) }} 个项目</span>
          <span class="tag" :style="{ color: statusMap[u.status].color }">{{ statusMap[u.status].text }}</span>
        </div>
        <div class="m-acts">
          <button class="btn btn-secondary btn-sm" title="发送消息"><MessageSquare :size="14" /> 消息</button>
          <button class="btn btn-secondary btn-sm" title="发送邮件"><Mail :size="14" /></button>
        </div>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-else class="table glass">
      <div class="tr th">
        <span>成员</span><span>角色</span><span>状态</span><span>项目</span><span></span>
      </div>
      <div v-for="u in list" :key="u.id" class="tr">
        <span class="cell-user">
          <img :src="u.avatar" :alt="u.name" class="ava-s" />
          <span>
            <b>{{ u.name }}</b>
            <small>{{ u.email }}</small>
          </span>
        </span>
        <span><i class="tag" :class="roleCls(u.role)">{{ roleText(u.role) }}</i></span>
        <span class="cell-status">
          <i class="sdot" :style="{ background: statusMap[u.status].color }"></i>
          {{ statusMap[u.status].text }}
        </span>
        <span>{{ projCount(u.id) }}</span>
        <span class="cell-acts">
          <button class="btn btn-icon btn-ghost"><Mail :size="15" /></button>
          <button class="btn btn-icon btn-ghost"><MoreHorizontal :size="15" /></button>
        </span>
      </div>
    </div>

    <transition name="pop">
      <Modal v-if="showInvite" title="邀请新成员" @close="showInvite = false">
        <div class="form-group">
          <label>邮箱地址 *</label>
          <input v-model="invite.email" type="email" class="input" placeholder="teammate@company.com" autofocus />
        </div>
        <div class="form-group">
          <label>角色</label>
          <select v-model="invite.role" class="input">
            <option value="member">成员</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <div class="form-group">
          <label>加入项目</label>
          <select v-model="invite.projects" class="input" multiple style="min-height: 100px">
            <option v-for="p in projects.projects" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
        <template #foot>
          <button class="btn btn-secondary" @click="showInvite = false">取消</button>
          <button class="btn btn-primary" @click="showInvite = false">发送邀请</button>
        </template>
      </Modal>
    </transition>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
h1 { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
.sub { font-size: 13px; color: var(--text-2); margin-top: 3px; }
.acts { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.search { position: relative; }
.search svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-3);
}
.search .input { padding-left: 34px; width: 210px; }
.toggle {
  display: flex;
  background: var(--bg-input);
  border-radius: var(--r-md);
  padding: 3px;
}
.toggle .on { background: var(--bg-solid); box-shadow: var(--shadow-sm); color: var(--blue); }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}
.mcard {
  border-radius: var(--r-xl);
  padding: 22px 20px;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.mcard:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.m-top { position: relative; display: inline-block; }
.ava {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: var(--bg-soft);
  border: 3px solid var(--bg-solid);
}
.status {
  position: absolute;
  right: 3px;
  bottom: 3px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 3px solid var(--bg-solid);
}
.mcard h3 { font-size: 16px; font-weight: 700; margin-top: 12px; }
.mail { font-size: 12px; color: var(--text-3); margin-top: 2px; }
.m-tags {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.m-acts {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
}
.table { border-radius: var(--r-xl); overflow: hidden; }
.tr {
  display: grid;
  grid-template-columns: 1.6fr 0.8fr 0.8fr 0.6fr auto;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-glass);
  font-size: 13px;
}
.tr:last-child { border-bottom: none; }
.th {
  background: var(--bg-input);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.tr:not(.th):hover { background: var(--bg-input); }
.cell-user { display: flex; align-items: center; gap: 12px; }
.cell-user b { display: block; font-size: 14px; }
.cell-user small { font-size: 12px; color: var(--text-3); }
.ava-s { width: 36px; height: 36px; border-radius: 50%; background: var(--bg-soft); }
.cell-status { display: flex; align-items: center; gap: 7px; }
.sdot { width: 8px; height: 8px; border-radius: 50%; }
.cell-acts { display: flex; gap: 4px; justify-content: flex-end; }
@media (max-width: 900px) {
  .search .input { width: 100%; }
  .acts { width: 100%; }
  .search { flex: 1; }
  .tr { grid-template-columns: 1fr auto; }
  .tr > span:nth-child(3), .tr > span:nth-child(4) { display: none; }
}
</style>
