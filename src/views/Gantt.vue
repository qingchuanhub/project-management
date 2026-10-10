<script setup>
import { ref, computed } from 'vue'
import { Calendar, ChevronLeft, ChevronRight, RotateCcw, ListTodo } from 'lucide-vue-next'
import { useProjectsStore, useTasksStore } from '../store'

const projects = useProjectsStore()
const tasksStore = useTasksStore()

const mode = ref('month')
const cursor = ref(new Date())
const pid = ref('all')

const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

const label = computed(() => {
  const d = cursor.value
  if (mode.value === 'month') return `${d.getFullYear()} 年 ${MONTHS[d.getMonth()]}`
  if (mode.value === 'week') {
    const s = new Date(d)
    s.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const e = new Date(s)
    e.setDate(s.getDate() + 6)
    return `${s.getMonth() + 1}/${s.getDate()} - ${e.getMonth() + 1}/${e.getDate()}`
  }
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日`
})

function shift(dir) {
  const d = new Date(cursor.value)
  if (mode.value === 'month') d.setMonth(d.getMonth() + dir)
  else if (mode.value === 'week') d.setDate(d.getDate() + dir * 7)
  else d.setDate(d.getDate() + dir)
  cursor.value = d
}
function today() {
  cursor.value = new Date()
}

/* 时间轴范围 */
const range = computed(() => {
  const c = cursor.value
  if (mode.value === 'month') {
    const start = new Date(c.getFullYear(), c.getMonth(), 1)
    const end = new Date(c.getFullYear(), c.getMonth() + 1, 1)
    return { start, end, days: (end - start) / 86400000 }
  }
  if (mode.value === 'week') {
    const start = new Date(c)
    start.setDate(c.getDate() - ((c.getDay() + 6) % 7))
    const end = new Date(start)
    end.setDate(start.getDate() + 7)
    return { start, end, days: 7 }
  }
  const start = new Date(c.getFullYear(), c.getMonth(), c.getDate())
  const end = new Date(start)
  end.setDate(start.getDate() + 1)
  return { start, end, days: 1 }
})

const ticks = computed(() => {
  const { start, days } = range.value
  const n = Math.min(days, 31)
  const arr = []
  for (let i = 0; i < n; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    arr.push(d)
  }
  return arr
})

const rows = computed(() => {
  let ts = tasksStore.tasks.filter((t) => t.due)
  if (pid.value !== 'all') ts = ts.filter((t) => t.pid === pid.value)
  return ts.map((t) => {
    const p = projects.projects.find((x) => x.id === t.pid)
    const start = new Date(t.due)
    start.setDate(start.getDate() - 5)
    return {
      id: t.id,
      title: t.title,
      project: p ? p.name : '',
      color: p ? p.color : '#0071e3',
      start,
      end: new Date(t.due),
      progress: t.col === 'done' ? 100 : t.col === 'doing' ? 55 : t.col === 'review' ? 80 : 10,
      today: new Date(new Date().toDateString())
    }
  })
})

function barStyle(r) {
  const { start, end, days } = range.value
  const total = end - start
  const s = Math.max(0, (r.start - start) / total)
  const e = Math.min(1, (r.end - start) / total)
  return {
    left: s * 100 + '%',
    width: Math.max(2, (e - s) * 100) + '%',
    background: `linear-gradient(90deg, ${r.color}, ${r.color}cc)`
  }
}

function progressOf(r) {
  const { start, end } = range.value
  const total = end - start
  const s = Math.max(start, r.start)
  const e = Math.min(end, r.end)
  if (e <= start) return 0
  const full = (Math.min(end, r.end) - Math.max(start, r.start)) / total
  return full > 0 ? Math.min(100, (r.progress / 100) * 100) : 0
}
</script>

<template>
  <div>
    <div class="head">
      <div>
        <h1>甘特图</h1>
        <p class="sub">项目时间线与任务进度可视化</p>
      </div>
      <div class="acts">
        <select v-model="pid" class="input" style="width: 170px">
          <option value="all">全部项目</option>
          <option v-for="p in projects.projects" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <div class="toggle">
          <button v-for="m in ['month', 'week', 'day']" :key="m" class="btn btn-sm" :class="mode === m ? 'btn-primary' : 'btn-ghost'" @click="mode = m">
            {{ m === 'month' ? '月' : m === 'week' ? '周' : '日' }}
          </button>
        </div>
        <div class="nav">
          <button class="btn btn-icon btn-ghost" @click="shift(-1)"><ChevronLeft :size="18" /></button>
          <b class="label">{{ label }}</b>
          <button class="btn btn-icon btn-ghost" @click="shift(1)"><ChevronRight :size="18" /></button>
        </div>
        <button class="btn btn-secondary btn-sm" @click="today"><RotateCcw :size="14" /> 今天</button>
      </div>
    </div>

    <div class="board glass">
      <div class="bhead">
        <div class="c-task">任务</div>
        <div class="c-proj">项目</div>
        <div class="c-time">
          <span v-for="(d, i) in ticks" :key="i" class="tick">
            <b>{{ d.getDate() }}</b>
            <small v-if="mode !== 'day'">{{ ['日','一','二','三','四','五','六'][d.getDay()] }}</small>
          </span>
        </div>
      </div>

      <div class="bbody">
        <div v-for="r in rows" :key="r.id" class="brow">
          <div class="c-task cell-task">
            <i class="cdot" :style="{ background: r.color }"></i>
            <span>{{ r.title }}</span>
          </div>
          <div class="c-proj cell-proj">{{ r.project }}</div>
          <div class="c-time">
            <div class="track">
              <div class="bar" :style="barStyle(r)">
                <i class="fill" :style="{ width: r.progress + '%' }"></i>
              </div>
              <i class="today-line" v-if="r.today >= range.start && r.today < range.end"
                 :style="{ left: ((r.today - range.start) / (range.end - range.start)) * 100 + '%' }"></i>
            </div>
          </div>
        </div>

        <div v-if="!rows.length" class="empty">
          <ListTodo :size="34" />
          <span>暂无带截止日期的任务</span>
        </div>
      </div>
    </div>
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
.toggle {
  display: flex;
  background: var(--bg-input);
  border-radius: var(--r-md);
  padding: 3px;
  gap: 2px;
}
.nav {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--bg-input);
  border-radius: var(--r-md);
  padding: 3px;
}
.label {
  min-width: 130px;
  text-align: center;
  font-size: 13px;
}
.board {
  border-radius: var(--r-xl);
  overflow: hidden;
}
.bhead {
  display: grid;
  grid-template-columns: 240px 130px 1fr;
  background: var(--bg-input);
  border-bottom: 1px solid var(--border);
  font-size: 12px;
  font-weight: 700;
  color: var(--text-2);
}
.bhead > div { padding: 12px 16px; }
.c-time {
  display: flex;
  overflow: hidden;
}
.tick {
  flex: 1;
  min-width: 26px;
  text-align: center;
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.tick b { font-size: 12px; font-weight: 700; }
.tick small { font-size: 9px; color: var(--text-3); }
.bbody { max-height: calc(100vh - 300px); overflow-y: auto; }
.brow {
  display: grid;
  grid-template-columns: 240px 130px 1fr;
  border-bottom: 1px solid var(--border-glass);
  align-items: center;
  transition: background 0.15s;
}
.brow:hover { background: var(--bg-input); }
.brow > div { padding: 12px 16px; }
.cell-task {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
}
.cdot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.cell-proj { font-size: 12px; color: var(--text-2); }
.track {
  position: relative;
  height: 26px;
  background: var(--bg-input);
  border-radius: 7px;
}
.bar {
  position: absolute;
  top: 3px;
  height: 20px;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  transition: all 0.3s ease;
}
.fill {
  display: block;
  height: 100%;
  background: rgba(255, 255, 255, 0.35);
}
.today-line {
  position: absolute;
  top: -4px;
  bottom: -4px;
  width: 2px;
  background: var(--red);
  z-index: 3;
}
@media (max-width: 900px) {
  .bhead, .brow { grid-template-columns: 150px 1fr; }
  .c-proj { display: none; }
}
</style>
