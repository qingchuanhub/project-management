<script setup>
import { ref, computed } from 'vue'
import { Plus, Search, LayoutGrid, List } from 'lucide-vue-next'
import ProjectCard from '../components/ProjectCard.vue'
import Modal from '../components/Modal.vue'
import { useProjectsStore } from '../store'

const store = useProjectsStore()

const view = ref('grid')
const q = ref('')
const filter = ref('all')
const showNew = ref(false)

const form = ref({
  name: '',
  desc: '',
  status: 'planning',
  color: '#0071e3',
  icon: '🚀',
  start: new Date().toISOString().slice(0, 10),
  end: ''
})

const list = computed(() => {
  let arr = store.projects
  if (q.value.trim()) {
    const s = q.value.toLowerCase()
    arr = arr.filter((p) => p.name.toLowerCase().includes(s) || p.desc.toLowerCase().includes(s))
  }
  if (filter.value !== 'all') arr = arr.filter((p) => p.status === filter.value)
  return arr
})

const colors = ['#0071e3', '#30d158', '#ff9f0a', '#bf5af2', '#ff2d55', '#64d2ff']
const icons = ['🚀', '📱', '⚙️', '🎨', '📊', '🌐', '🔐', '⚡']

function create() {
  if (!form.value.name.trim()) return
  store.add({ ...form.value, end: form.value.end || form.value.start })
  showNew.value = false
  form.value = { name: '', desc: '', status: 'planning', color: '#0071e3', icon: '🚀', start: new Date().toISOString().slice(0, 10), end: '' }
}
</script>

<template>
  <div>
    <div class="head">
      <div>
        <h1>项目</h1>
        <p class="sub">共 {{ list.length }} 个项目 · 管理进度与协作</p>
      </div>
      <div class="acts">
        <div class="search">
          <Search :size="15" />
          <input v-model="q" class="input" placeholder="搜索项目…" />
        </div>
        <div class="toggle">
          <button class="btn btn-icon btn-ghost" :class="{ on: view === 'grid' }" @click="view = 'grid'">
            <LayoutGrid :size="17" />
          </button>
          <button class="btn btn-icon btn-ghost" :class="{ on: view === 'list' }" @click="view = 'list'">
            <List :size="17" />
          </button>
        </div>
        <select v-model="filter" class="input" style="width: 120px">
          <option value="all">全部状态</option>
          <option value="active">进行中</option>
          <option value="planning">规划中</option>
          <option value="completed">已完成</option>
        </select>
        <button class="btn btn-primary" @click="showNew = true">
          <Plus :size="16" /> 新建项目
        </button>
      </div>
    </div>

    <div :class="view === 'grid' ? 'grid' : 'rows'">
      <template v-if="view === 'grid'">
        <ProjectCard v-for="p in list" :key="p.id" :project="p" />
        <button class="add-card" @click="showNew = true">
          <Plus :size="24" />
          <b>新建项目</b>
          <span>开始新的协作</span>
        </button>
      </template>
      <template v-else>
        <div v-for="p in list" :key="p.id" class="row-item glass" @click="view = 'grid'">
          <span class="rico" :style="{ background: p.color + '1f' }">{{ p.icon }}</span>
          <div class="rmain">
            <b>{{ p.name }}</b>
            <small>{{ p.desc }}</small>
          </div>
          <span class="tag" :class="{ 'tag-green': p.status === 'active', 'tag-orange': p.status === 'planning', 'tag-purple': p.status === 'completed' }">
            {{ p.status === 'active' ? '进行中' : p.status === 'planning' ? '规划中' : '已完成' }}
          </span>
          <div class="rbar"><i :style="{ width: p.progress + '%', background: p.color }"></i></div>
          <span class="rpct">{{ p.progress }}%</span>
        </div>
      </template>
      <div v-if="!list.length" class="empty" style="grid-column: 1/-1">
        <Search :size="34" />
        <span>没有匹配的项目</span>
      </div>
    </div>

    <transition name="pop">
      <Modal v-if="showNew" title="新建项目" @close="showNew = false">
        <div class="form-group">
          <label>项目名称 *</label>
          <input v-model="form.name" class="input" placeholder="输入项目名称" autofocus />
        </div>
        <div class="form-group">
          <label>项目描述</label>
          <textarea v-model="form.desc" class="input" placeholder="简单描述这个项目"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>状态</label>
            <select v-model="form.status" class="input">
              <option value="planning">规划中</option>
              <option value="active">进行中</option>
            </select>
          </div>
          <div class="form-group">
            <label>预计完成</label>
            <input v-model="form.end" type="date" class="input" />
          </div>
        </div>
        <div class="form-group">
          <label>项目图标</label>
          <div class="pick">
            <button
              v-for="i in icons"
              :key="i"
              type="button"
              class="opt"
              :class="{ on: form.icon === i }"
              @click="form.icon = i"
            >{{ i }}</button>
          </div>
        </div>
        <div class="form-group">
          <label>主题色</label>
          <div class="pick">
            <button
              v-for="c in colors"
              :key="c"
              type="button"
              class="copt"
              :class="{ on: form.color === c }"
              :style="{ background: c }"
              @click="form.color = c"
            ></button>
          </div>
        </div>
        <template #foot>
          <button class="btn btn-secondary" @click="showNew = false">取消</button>
          <button class="btn btn-primary" @click="create">创建</button>
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
.acts {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.search { position: relative; }
.search svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-3);
}
.search .input { padding-left: 34px; width: 220px; }
.toggle {
  display: flex;
  background: var(--bg-input);
  border-radius: var(--r-md);
  padding: 3px;
}
.toggle .on { background: var(--bg-solid); box-shadow: var(--shadow-sm); color: var(--blue); }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.add-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 220px;
  background: transparent;
  border: 2px dashed var(--border);
  border-radius: var(--r-lg);
  color: var(--text-3);
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}
.add-card:hover {
  border-color: var(--blue);
  color: var(--blue);
  background: rgba(0, 113, 227, 0.04);
}
.add-card b { font-size: 15px; }
.add-card span { font-size: 12px; }
.rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.row-item {
  display: grid;
  grid-template-columns: auto 1fr auto 160px 48px;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border-radius: var(--r-md);
  cursor: pointer;
  transition: transform 0.15s;
}
.row-item:hover { transform: translateX(4px); }
.rico {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.rmain b { font-size: 14px; display: block; }
.rmain small { font-size: 12px; color: var(--text-2); }
.rbar {
  height: 7px;
  background: var(--bg-input);
  border-radius: 4px;
  overflow: hidden;
}
.rbar i { display: block; height: 100%; border-radius: 4px; }
.rpct { font-size: 13px; font-weight: 700; text-align: right; }
.pick { display: flex; gap: 8px; flex-wrap: wrap; }
.opt {
  width: 40px;
  height: 40px;
  font-size: 18px;
  background: var(--bg-input);
  border: 2px solid transparent;
  border-radius: var(--r-sm);
  cursor: pointer;
  transition: all 0.15s;
}
.opt.on { border-color: var(--blue); background: rgba(0, 113, 227, 0.1); }
.copt {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: transform 0.15s;
}
.copt.on { border-color: var(--text); transform: scale(1.15); }
@media (max-width: 900px) {
  .search .input { width: 100%; }
  .acts { width: 100%; }
  .search { flex: 1; }
  .row-item { grid-template-columns: auto 1fr auto; }
  .rbar, .rpct { display: none; }
}
</style>
