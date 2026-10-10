<script setup>
import { ref, computed } from 'vue'
import { Plus, Search } from 'lucide-vue-next'
import TaskCard from '../components/TaskCard.vue'
import Modal from '../components/Modal.vue'
import { useProjectsStore, useTasksStore, useUsersStore } from '../store'

const projects = useProjectsStore()
const tasksStore = useTasksStore()
const usersStore = useUsersStore()

const pid = ref('p1')
const q = ref('')
const showNew = ref(false)
const dragOver = ref('')

const cols = tasksStore.columns

const form = ref({
  title: '',
  desc: '',
  col: 'todo',
  priority: 'medium',
  assignee: '1',
  due: ''
})

function tasksOf(col) {
  let arr = tasksStore.byCol(pid.value, col)
  if (q.value.trim()) {
    const s = q.value.toLowerCase()
    arr = arr.filter((t) => t.title.toLowerCase().includes(s) || (t.desc || '').toLowerCase().includes(s))
  }
  return arr
}

const counts = computed(() => {
  const o = {}
  cols.forEach((c) => (o[c.id] = tasksOf(c.id).length))
  return o
})

function onDrop(e, colId) {
  e.preventDefault()
  dragOver.value = ''
  const id = e.dataTransfer.getData('text/plain')
  if (!id) return
  const index = tasksOf(colId).length
  tasksStore.move(id, colId, index)
}

function create() {
  if (!form.value.title.trim()) return
  tasksStore.add({ ...form.value, pid: pid.value, tags: [] })
  showNew.value = false
  form.value = { title: '', desc: '', col: 'todo', priority: 'medium', assignee: '1', due: '' }
}
</script>

<template>
  <div class="kanban">
    <div class="head">
      <div>
        <h1>看板</h1>
        <p class="sub">拖拽任务卡片调整状态 · 共 {{ tasksStore.byProject(pid).length }} 个任务</p>
      </div>
      <div class="acts">
        <select v-model="pid" class="input" style="width: 190px">
          <option v-for="p in projects.projects" :key="p.id" :value="p.id">{{ p.icon }} {{ p.name }}</option>
        </select>
        <div class="search">
          <Search :size="15" />
          <input v-model="q" class="input" placeholder="搜索任务…" />
        </div>
        <button class="btn btn-primary" @click="showNew = true">
          <Plus :size="16" /> 新建任务
        </button>
      </div>
    </div>

    <div class="board">
      <section
        v-for="c in cols"
        :key="c.id"
        class="col glass"
        :class="{ over: dragOver === c.id }"
        @dragover.prevent="dragOver = c.id"
        @dragleave="dragOver = ''"
        @drop="onDrop($event, c.id)"
      >
        <header class="col-head">
          <i class="cdot" :style="{ background: c.color }"></i>
          <h3>{{ c.title }}</h3>
          <span class="count">{{ counts[c.id] }}</span>
          <button class="btn btn-icon btn-ghost" @click="form.col = c.id; showNew = true">
            <Plus :size="15" />
          </button>
        </header>

        <div class="col-body">
          <TaskCard v-for="t in tasksOf(c.id)" :key="t.id" :task="t" />
          <div v-if="!tasksOf(c.id).length" class="empty">
            <span>暂无任务</span>
            <button class="btn btn-ghost btn-sm" @click="form.col = c.id; showNew = true">
              <Plus :size="13" /> 添加任务
            </button>
          </div>
        </div>
      </section>
    </div>

    <transition name="pop">
      <Modal v-if="showNew" title="新建任务" @close="showNew = false">
        <div class="form-group">
          <label>任务标题 *</label>
          <input v-model="form.title" class="input" placeholder="输入任务标题" autofocus />
        </div>
        <div class="form-group">
          <label>任务描述</label>
          <textarea v-model="form.desc" class="input" placeholder="任务详情"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>状态列</label>
            <select v-model="form.col" class="input">
              <option v-for="c in cols" :key="c.id" :value="c.id">{{ c.title }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>优先级</label>
            <select v-model="form.priority" class="input">
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>负责人</label>
            <select v-model="form.assignee" class="input">
              <option v-for="u in usersStore.users" :key="u.id" :value="u.id">{{ u.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>截止日期</label>
            <input v-model="form.due" type="date" class="input" />
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
.search .input { padding-left: 34px; width: 200px; }
.board {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 12px;
  min-height: calc(100vh - 240px);
}
.col {
  flex: 1;
  min-width: 260px;
  max-width: 340px;
  border-radius: var(--r-xl);
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.col.over {
  border-color: rgba(0, 113, 227, 0.5);
  box-shadow: 0 0 0 2px rgba(0, 113, 227, 0.18);
}
.col-head {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 15px 16px;
  border-bottom: 1px solid var(--border-glass);
}
.cdot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.col-head h3 {
  font-size: 14px;
  font-weight: 700;
}
.count {
  font-size: 11px;
  font-weight: 700;
  background: var(--bg-input);
  color: var(--text-2);
  padding: 2px 8px;
  border-radius: 20px;
}
.col-head .btn { margin-left: auto; }
.col-body {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  max-height: calc(100vh - 330px);
}
@media (max-width: 900px) {
  .search { flex: 1; }
  .search .input { width: 100%; }
  .acts { width: 100%; }
  .col { min-width: 250px; }
}
</style>
