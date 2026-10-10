<script setup>
import { ref, computed } from 'vue'
import {
  Target, CheckCircle2, Flag, Clock, TrendingUp, Layers
} from 'lucide-vue-next'
import StatCard from '../components/StatCard.vue'
import { useProjectsStore, useTasksStore, useUsersStore } from '../store'

const projects = useProjectsStore()
const tasksStore = useTasksStore()
const usersStore = useUsersStore()

const range = ref('month')

const total = computed(() => tasksStore.tasks.length)
const doneN = computed(() => tasksStore.tasks.filter((t) => t.col === 'done').length)
const doingN = computed(() => tasksStore.tasks.filter((t) => t.col === 'doing').length)
const overdueN = computed(() =>
  tasksStore.tasks.filter((t) => t.col !== 'done' && t.due && new Date(t.due) < new Date()).length
)
const rate = computed(() => (total.value ? Math.round((doneN.value / total.value) * 100) : 0))

const stats = computed(() => [
  { label: '总任务数', value: total.value, icon: Target, color: '#0071e3', trend: '全部' },
  { label: '已完成', value: doneN.value, icon: CheckCircle2, color: '#30d158', trend: '+18%' },
  { label: '进行中', value: doingN.value, icon: Flag, color: '#ff9f0a', trend: '推进中' },
  { label: '逾期任务', value: overdueN.value, icon: Clock, color: '#ff453a', trend: overdueN.value ? '需关注' : '良好' },
  { label: '完成率', value: rate.value + '%', icon: TrendingUp, color: '#bf5af2', trend: '健康' },
  { label: '活跃项目', value: projects.active.length, icon: Layers, color: '#64d2ff', trend: '进行中' }
])

/* ---- 状态分布环形图 ---- */
const donut = computed(() => {
  const segs = tasksStore.columns.map((c) => ({
    id: c.id,
    title: c.title,
    color: c.color,
    n: tasksStore.tasks.filter((t) => t.col === c.id).length
  }))
  const sum = segs.reduce((a, s) => a + s.n, 0) || 1
  const R = 70
  const C = 2 * Math.PI * R
  let acc = 0
  segs.forEach((s) => {
    const frac = s.n / sum
    s.len = frac * C
    s.gap = C - s.len
    s.offset = -acc
    acc += s.len
  })
  return { segs, sum, C, R }
})

/* ---- 优先级分布 ---- */
const priorities = computed(() => {
  const map = { high: ['高', '#ff453a'], medium: ['中', '#ff9f0a'], low: ['低', '#30d158'] }
  return Object.entries(map).map(([k, [text, color]]) => ({
    key: k,
    text,
    color,
    n: tasksStore.tasks.filter((t) => t.priority === k).length
  }))
})
const maxPri = computed(() => Math.max(1, ...priorities.value.map((p) => p.n)))

/* ---- 每周完成趋势 ---- */
const week = ref([
  { d: '周一', done: 3, new: 2 },
  { d: '周二', done: 5, new: 4 },
  { d: '周三', done: 2, new: 3 },
  { d: '周四', done: 6, new: 2 },
  { d: '周五', done: 4, new: 5 },
  { d: '周六', done: 1, new: 1 },
  { d: '周日', done: 2, new: 0 }
])
const maxWeek = computed(() => Math.max(...week.value.map((w) => Math.max(w.done, w.new)), 1))

/* ---- 项目进度 ---- */
const projProg = computed(() => projects.projects.map((p) => ({ name: p.name, progress: p.progress, color: p.color, icon: p.icon })))

/* ---- 贡献榜 ---- */
const leaders = computed(() => {
  const m = {}
  tasksStore.tasks.forEach((t) => {
    if (t.assignee) m[t.assignee] = (m[t.assignee] || 0) + 1
  })
  return Object.entries(m)
    .map(([id, n]) => ({ u: usersStore.get(id), n }))
    .filter((x) => x.u)
    .sort((a, b) => b.n - a.n)
    .slice(0, 5)
})
</script>

<template>
  <div>
    <div class="head">
      <div>
        <h1>统计</h1>
        <p class="sub">团队进度与绩效数据洞察</p>
      </div>
      <select v-model="range" class="input" style="width: 130px">
        <option value="week">本周</option>
        <option value="month">本月</option>
        <option value="quarter">本季度</option>
        <option value="year">全年</option>
      </select>
    </div>

    <div class="stats">
      <StatCard v-for="s in stats" :key="s.label" v-bind="s" />
    </div>

    <div class="grid-2">
      <!-- 状态分布 -->
      <section class="panel glass">
        <h2>任务状态分布</h2>
        <div class="donut-wrap">
          <div class="donut">
            <svg viewBox="0 0 160 160">
              <circle cx="80" cy="80" :r="donut.R" fill="none" stroke="var(--bg-input)" stroke-width="22" />
              <circle
                v-for="s in donut.segs"
                :key="s.id"
                cx="80" cy="80" :r="donut.R"
                fill="none"
                :stroke="s.color"
                stroke-width="22"
                :stroke-dasharray="`${s.len} ${s.gap}`"
                :stroke-dashoffset="s.offset"
                stroke-linecap="butt"
                transform="rotate(-90 80 80)"
              />
            </svg>
            <div class="donut-center">
              <b>{{ donut.sum }}</b>
              <small>总任务</small>
            </div>
          </div>
          <ul class="legend">
            <li v-for="s in donut.segs" :key="s.id">
              <i :style="{ background: s.color }"></i>
              <span>{{ s.title }}</span>
              <b>{{ s.n }}</b>
            </li>
          </ul>
        </div>
      </section>

      <!-- 优先级 -->
      <section class="panel glass">
        <h2>优先级分布</h2>
        <div class="bars">
          <div v-for="p in priorities" :key="p.key" class="bar-row">
            <span class="b-label" :style="{ color: p.color }">{{ p.text }}</span>
            <div class="b-track">
              <i :style="{ width: (p.n / maxPri) * 100 + '%', background: p.color }"></i>
            </div>
            <b class="b-num">{{ p.n }}</b>
          </div>
        </div>

        <h2 style="margin-top: 24px">项目进度</h2>
        <div class="bars">
          <div v-for="p in projProg" :key="p.name" class="bar-row">
            <span class="b-label">{{ p.icon }} {{ p.name }}</span>
            <div class="b-track">
              <i :style="{ width: p.progress + '%', background: p.color }"></i>
            </div>
            <b class="b-num">{{ p.progress }}%</b>
          </div>
        </div>
      </section>
    </div>

    <div class="grid-2">
      <!-- 周趋势 -->
      <section class="panel glass">
        <h2>每周完成趋势</h2>
        <div class="wchart">
          <div v-for="w in week" :key="w.d" class="wcol">
            <div class="wbars">
              <i class="wb done" :style="{ height: (w.done / maxWeek) * 100 + '%' }" :title="w.done + ' 完成'"></i>
              <i class="wb new" :style="{ height: (w.new / maxWeek) * 100 + '%' }" :title="w.new + ' 新建'"></i>
            </div>
            <small>{{ w.d }}</small>
          </div>
        </div>
        <div class="wlegend">
          <span><i style="background:#30d158"></i> 已完成</span>
          <span><i style="background:#0071e3"></i> 新建</span>
        </div>
      </section>

      <!-- 贡献榜 -->
      <section class="panel glass">
        <h2>贡献榜</h2>
        <ol class="leads">
          <li v-for="(l, i) in leaders" :key="l.u.id">
            <em :class="'rank r' + (i + 1)">{{ i + 1 }}</em>
            <img :src="l.u.avatar" :alt="l.u.name" />
            <div>
              <b>{{ l.u.name }}</b>
              <small>{{ l.u.role === 'admin' ? '管理员' : '成员' }}</small>
            </div>
            <span class="n">{{ l.n }} 任务</span>
          </li>
          <div v-if="!leaders.length" class="empty">暂无数据</div>
        </ol>
      </section>
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
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
.panel { border-radius: var(--r-xl); padding: 22px; }
.panel h2 { font-size: 15px; font-weight: 700; margin-bottom: 18px; }
.donut-wrap { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
.donut { position: relative; width: 160px; height: 160px; flex-shrink: 0; }
.donut svg { width: 100%; height: 100%; }
.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.donut-center b { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
.donut-center small { font-size: 11px; color: var(--text-3); }
.legend { list-style: none; display: flex; flex-direction: column; gap: 11px; flex: 1; min-width: 140px; }
.legend li { display: flex; align-items: center; gap: 9px; font-size: 13px; }
.legend i { width: 11px; height: 11px; border-radius: 3px; }
.legend span { flex: 1; color: var(--text-2); }
.legend b { font-weight: 700; }
.bars { display: flex; flex-direction: column; gap: 14px; }
.bar-row { display: flex; align-items: center; gap: 12px; }
.b-label { min-width: 92px; font-size: 13px; color: var(--text-2); }
.b-track { flex: 1; height: 22px; background: var(--bg-input); border-radius: 6px; overflow: hidden; }
.b-track i { display: block; height: 100%; border-radius: 6px; transition: width 0.5s ease; }
.b-num { min-width: 40px; text-align: right; font-size: 13px; }
.wchart { display: flex; gap: 8px; align-items: flex-end; height: 170px; }
.wcol { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; }
.wbars { flex: 1; display: flex; align-items: flex-end; gap: 3px; width: 100%; justify-content: center; }
.wb { width: 14px; border-radius: 5px 5px 0 0; min-height: 3px; transition: height 0.4s ease; }
.wb.done { background: var(--green); }
.wb.new { background: var(--blue); opacity: 0.55; }
.wcol small { font-size: 11px; color: var(--text-3); }
.wlegend { display: flex; gap: 18px; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border-glass); font-size: 12px; color: var(--text-2); }
.wlegend i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 5px; vertical-align: -1px; }
.leads { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.leads li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 13px;
  background: var(--bg-input);
  border-radius: var(--r-md);
}
.leads img { width: 36px; height: 36px; border-radius: 50%; background: var(--bg-soft); }
.leads b { display: block; font-size: 14px; }
.leads small { font-size: 11px; color: var(--text-3); }
.leads .n { margin-left: auto; font-size: 13px; font-weight: 700; color: var(--blue); }
.rank {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  font-style: normal;
  background: var(--bg-solid);
  color: var(--text-3);
  flex-shrink: 0;
}
.r1 { background: #ffd60a; color: #1d1d1f; }
.r2 { background: #d1d1d6; color: #1d1d1f; }
.r3 { background: #e8a87c; color: #fff; }
@media (max-width: 1000px) {
  .grid-2 { grid-template-columns: 1fr; }
}
</style>
