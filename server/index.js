const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const initSqlJs = require('sql.js')

const PORT = process.env.PORT || 3000
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data')
fs.mkdirSync(DATA_DIR, { recursive: true })

const DB_FILE = path.join(DATA_DIR, 'projectflow.db')
const SECRET_FILE = path.join(DATA_DIR, 'jwt.secret')

let JWT_SECRET
if (fs.existsSync(SECRET_FILE)) {
  JWT_SECRET = fs.readFileSync(SECRET_FILE, 'utf8').trim()
} else {
  JWT_SECRET = crypto.randomBytes(32).toString('hex')
  fs.writeFileSync(SECRET_FILE, JWT_SECRET)
}

let db

function saveDb() {
  const data = db.export()
  const buffer = Buffer.from(data)
  const tmp = DB_FILE + '.tmp'
  fs.writeFileSync(tmp, buffer)
  fs.renameSync(tmp, DB_FILE)
}

function dbGet(sql, params) {
  const stmt = db.prepare(sql)
  stmt.bind(params || [])
  let row = null
  if (stmt.step()) row = stmt.getAsObject()
  stmt.free()
  return row
}

function dbAll(sql, params) {
  const stmt = db.prepare(sql)
  stmt.bind(params || [])
  const rows = []
  while (stmt.step()) rows.push(stmt.getAsObject())
  stmt.free()
  return rows
}

function dbRun(sql, params) {
  db.run(sql, params || [])
}

function now() {
  return new Date().toISOString()
}

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, avatar: u.avatar, role: u.role, status: u.status, bio: u.bio || '', timezone: u.timezone || '' }
}

function parseJson(s, fallback) {
  try { return JSON.parse(s) } catch (e) { return fallback }
}

function rowToProject(r) {
  return {
    id: r.id, name: r.name, desc: r.desc, status: r.status, progress: r.progress,
    start: r.start, end: r.end, color: r.color, icon: r.icon,
    members: parseJson(r.members, []), tags: parseJson(r.tags, [])
  }
}

function rowToTask(r) {
  return {
    id: r.id, pid: r.pid, col: r.col, title: r.title, desc: r.desc,
    priority: r.priority, assignee: r.assignee, due: r.due,
    tags: parseJson(r.tags, []), order: r.ord
  }
}

function uid(prefix) {
  return prefix + crypto.randomBytes(8).toString('hex')
}

async function initDb() {
  const SQL = await initSqlJs()
  if (fs.existsSync(DB_FILE)) {
    db = new SQL.Database(fs.readFileSync(DB_FILE))
  } else {
    db = new SQL.Database()
  }
  db.run('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE, pass TEXT, avatar TEXT, role TEXT DEFAULT \'member\', status TEXT DEFAULT \'online\', bio TEXT DEFAULT \'\', timezone TEXT DEFAULT \'Asia/Shanghai (UTC+8)\', created_at TEXT)')
  db.run('CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT, desc TEXT, status TEXT, progress INTEGER, start TEXT, end TEXT, color TEXT, icon TEXT, members TEXT DEFAULT \'[]\', tags TEXT DEFAULT \'[]\', created_at TEXT)')
  db.run('CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, pid TEXT, col TEXT, title TEXT, desc TEXT, priority TEXT, assignee TEXT, due TEXT, tags TEXT DEFAULT \'[]\', ord INTEGER DEFAULT 0, created_at TEXT)')
  seed()
}

function seed() {
  const row = dbGet('SELECT COUNT(*) AS c FROM users')
  if (row && row.c > 0) return

  const demoPass = bcrypt.hashSync('123456', 10)
  dbRun('INSERT INTO users (id,name,email,pass,avatar,role,status,created_at) VALUES (?,?,?,?,?,?,?,?)',
    ['u1', '林青川', 'demo@demo.com', demoPass, 'https://api.dicebear.com/9.x/notionists/svg?seed=lin', 'admin', 'online', now()])
  dbRun('INSERT INTO users (id,name,email,pass,avatar,role,status,created_at) VALUES (?,?,?,?,?,?,?,?)',
    ['u2', 'Sarah Chen', 'sarah@team.com', demoPass, 'https://api.dicebear.com/9.x/notionists/svg?seed=sarah', 'member', 'online', now()])
  dbRun('INSERT INTO users (id,name,email,pass,avatar,role,status,created_at) VALUES (?,?,?,?,?,?,?,?)',
    ['u3', 'Mike Wu', 'mike@team.com', demoPass, 'https://api.dicebear.com/9.x/notionists/svg?seed=mike', 'member', 'away', now()])
  dbRun('INSERT INTO users (id,name,email,pass,avatar,role,status,created_at) VALUES (?,?,?,?,?,?,?,?)',
    ['u4', 'Emily Zhang', 'emily@team.com', demoPass, 'https://api.dicebear.com/9.x/notionists/svg?seed=emily', 'member', 'offline', now()])
  dbRun('INSERT INTO users (id,name,email,pass,avatar,role,status,created_at) VALUES (?,?,?,?,?,?,?,?)',
    ['u5', 'David Lin', 'david@team.com', demoPass, 'https://api.dicebear.com/9.x/notionists/svg?seed=david', 'member', 'busy', now()])

  const p = (id, name, desc, status, progress, start, end, color, icon, members, tags) =>
    dbRun('INSERT INTO projects (id,name,desc,status,progress,start,end,color,icon,members,tags,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, name, desc, status, progress, start, end, color, icon, JSON.stringify(members), JSON.stringify(tags), now()])
  p('p1', 'Project Alpha', '核心产品重构与体验升级', 'active', 68, '2026-07-01', '2026-11-30', '#0071e3', '🚀', ['1', '2', '3'], ['产品', '重构'])
  p('p2', '移动端 App 2.0', '全新架构的跨平台移动应用', 'active', 35, '2026-08-15', '2026-12-31', '#30d158', '📱', ['2', '4'], ['移动端'])
  p('p3', 'API 网关迁移', '迁移至微服务架构，提升可用性', 'planning', 12, '2026-09-01', '2027-02-28', '#ff9f0a', '⚙️', ['1', '3', '5'], ['后端', '架构'])
  p('p4', '设计系统 v3', '统一多端设计语言与组件库', 'completed', 100, '2026-03-01', '2026-06-30', '#bf5af2', '🎨', ['4'], ['设计'])

  const t = (id, pid, col, title, desc, priority, assignee, due, tags, ord) =>
    dbRun('INSERT INTO tasks (id,pid,col,title,desc,priority,assignee,due,tags,ord,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [id, pid, col, title, desc, priority, assignee, due, JSON.stringify(tags), ord, now()])
  t('t1', 'p1', 'todo', '设计新版仪表盘布局', '完成线框图与高保真视觉稿', 'high', '1', '2026-10-25', ['设计'], 0)
  t('t2', 'p1', 'todo', '编写接口文档', '覆盖全部 REST 端点', 'medium', '3', '2026-10-20', ['文档'], 1)
  t('t3', 'p1', 'doing', '实现 OAuth 登录流程', '接入 GitHub 与 Google 第三方登录', 'high', '2', '2026-10-18', ['后端', '认证'], 0)
  t('t4', 'p1', 'doing', '暗色模式适配', '全部页面适配深色主题', 'medium', '4', '2026-10-22', ['前端'], 1)
  t('t5', 'p1', 'review', 'CI/CD 流水线搭建', 'GitHub Actions 自动测试与部署', 'medium', '5', '2026-10-15', ['DevOps'], 0)
  t('t6', 'p1', 'done', '项目脚手架初始化', 'Vite + Vue 3 基础工程', 'high', '1', '2026-10-10', ['工程化'], 0)
  t('t7', 'p2', 'todo', '新用户引导流程', '设计并实现移动端引导页', 'high', '4', '2026-11-05', ['设计'], 0)
  t('t8', 'p2', 'doing', '推送通知服务', '集成 FCM 实现消息推送', 'medium', '2', '2026-11-15', ['后端'], 0)
  t('t9', 'p3', 'todo', '服务网格配置', '部署 Istio 流量治理', 'high', '5', '2026-11-01', ['架构'], 0)
  t('t10', 'p3', 'doing', '分布式限流实现', '基于 Redis 的全局限流', 'medium', '1', '2026-10-30', ['后端'], 0)
  t('t11', 'p4', 'done', '色板与设计令牌', '定义语义化色彩变量', 'high', '4', '2026-06-01', ['设计'], 0)
  t('t12', 'p4', 'done', '组件库 v1.0', '核心组件开发与文档', 'high', '2', '2026-06-25', ['前端'], 1)

  saveDb()
  console.log('[seed] demo data initialized')
}

function authRequired(req, res, next) {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return res.status(401).json({ error: '未登录' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = dbGet('SELECT * FROM users WHERE id = ?', [payload.uid])
    if (!user) return res.status(401).json({ error: '用户不存在' })
    req.user = user
    next()
  } catch (e) {
    return res.status(401).json({ error: '登录已过期' })
  }
}

function sign(user) {
  return jwt.sign({ uid: user.id }, JWT_SECRET, { expiresIn: '30d' })
}

async function main() {
  await initDb()
  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', function (req, res) { res.json({ ok: true, ts: now() }) })

  app.post('/api/auth/register', function (req, res) {
    const body = req.body || {}
    const name = body.name
    const e = (body.email || '').trim().toLowerCase()
    const password = body.password
    if (!name || !e || !password) return res.status(400).json({ error: '请填写完整信息' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return res.status(400).json({ error: '邮箱格式不正确' })
    if (password.length < 6) return res.status(400).json({ error: '密码至少 6 位' })
    const exists = dbGet('SELECT id FROM users WHERE email = ?', [e])
    if (exists) return res.status(400).json({ error: '该邮箱已注册' })
    const id = uid('u')
    const avatar = 'https://api.dicebear.com/9.x/notionists/svg?seed=' + encodeURIComponent(e)
    dbRun('INSERT INTO users (id,name,email,pass,avatar,role,status,created_at) VALUES (?,?,?,?,?,?,?,?)',
      [id, name.trim(), e, bcrypt.hashSync(password, 10), avatar, 'member', 'online', now()])
    saveDb()
    const user = dbGet('SELECT * FROM users WHERE id = ?', [id])
    res.json({ token: sign(user), user: publicUser(user) })
  })

  app.post('/api/auth/login', function (req, res) {
    const body = req.body || {}
    const e = (body.email || '').trim().toLowerCase()
    const user = dbGet('SELECT * FROM users WHERE email = ?', [e])
    if (!user || !bcrypt.compareSync(body.password || '', user.pass)) {
      return res.status(401).json({ error: '邮箱或密码错误' })
    }
    res.json({ token: sign(user), user: publicUser(user) })
  })

  app.get('/api/auth/me', authRequired, function (req, res) {
    res.json({ user: publicUser(req.user) })
  })

  app.patch('/api/auth/me', authRequired, function (req, res) {
    const body = req.body || {}
    const u = req.user
    dbRun('UPDATE users SET name = ?, bio = ?, timezone = ? WHERE id = ?',
      [body.name !== undefined ? body.name : u.name,
       body.bio !== undefined ? body.bio : (u.bio || ''),
       body.timezone !== undefined ? body.timezone : (u.timezone || ''), u.id])
    saveDb()
    res.json({ user: publicUser(dbGet('SELECT * FROM users WHERE id = ?', [u.id])) })
  })

  app.delete('/api/auth/me', authRequired, function (req, res) {
    const u = req.user
    // 不删种子数据用户
    if (/^u[1-5]$/.test(u.id)) {
      return res.status(400).json({ error: '演示账号不可删除' })
    }
    dbRun('DELETE FROM users WHERE id = ?', [u.id])
    // 把该用户的任务转为未分配，项目成员列表中移除
    dbRun("UPDATE tasks SET assignee = '' WHERE assignee = ?", [u.id])
    const projects = dbAll('SELECT id, members FROM projects')
    for (let i = 0; i < projects.length; i++) {
      const members = parseJson(projects[i].members, [])
      if (members.indexOf(u.id) > -1) {
        const next = members.filter(function (m) { return m !== u.id })
        dbRun('UPDATE projects SET members = ? WHERE id = ?', [JSON.stringify(next), projects[i].id])
      }
    }
    saveDb()
    res.json({ ok: true })
  })

  app.get('/api/bootstrap', authRequired, function (req, res) {
    const users = dbAll('SELECT * FROM users').map(publicUser)
    const projects = dbAll('SELECT * FROM projects').map(rowToProject)
    const tasks = dbAll('SELECT * FROM tasks').map(rowToTask)
    res.json({ users: users, projects: projects, tasks: tasks })
  })

  app.get('/api/users', authRequired, function (req, res) {
    res.json({ users: dbAll('SELECT * FROM users').map(publicUser) })
  })

  app.get('/api/projects', authRequired, function (req, res) {
    res.json({ projects: dbAll('SELECT * FROM projects').map(rowToProject) })
  })

  app.post('/api/projects', authRequired, function (req, res) {
    const b = req.body || {}
    if (!b.name) return res.status(400).json({ error: '项目名称必填' })
    const id = uid('p')
    dbRun('INSERT INTO projects (id,name,desc,status,progress,start,end,color,icon,members,tags,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, b.name, b.desc || '', b.status || 'planning', b.progress || 0, b.start || '', b.end || '',
       b.color || '#0071e3', b.icon || '📁', JSON.stringify(b.members || []), JSON.stringify(b.tags || []), now()])
    saveDb()
    res.json({ project: rowToProject(dbGet('SELECT * FROM projects WHERE id = ?', [id])) })
  })

  app.patch('/api/projects/:id', authRequired, function (req, res) {
    const r = dbGet('SELECT * FROM projects WHERE id = ?', [req.params.id])
    if (!r) return res.status(404).json({ error: '项目不存在' })
    const b = req.body || {}
    const merged = rowToProject(r)
    const keys = ['name', 'desc', 'status', 'progress', 'start', 'end', 'color', 'icon']
    for (let i = 0; i < keys.length; i++) {
      if (b[keys[i]] !== undefined) merged[keys[i]] = b[keys[i]]
    }
    if (b.members !== undefined) merged.members = b.members
    if (b.tags !== undefined) merged.tags = b.tags
    dbRun('UPDATE projects SET name=?,desc=?,status=?,progress=?,start=?,end=?,color=?,icon=?,members=?,tags=? WHERE id=?',
      [merged.name, merged.desc, merged.status, merged.progress, merged.start, merged.end,
       merged.color, merged.icon, JSON.stringify(merged.members), JSON.stringify(merged.tags), r.id])
    saveDb()
    res.json({ project: rowToProject(dbGet('SELECT * FROM projects WHERE id = ?', [r.id])) })
  })

  app.delete('/api/projects/:id', authRequired, function (req, res) {
    dbRun('DELETE FROM projects WHERE id = ?', [req.params.id])
    dbRun('DELETE FROM tasks WHERE pid = ?', [req.params.id])
    saveDb()
    res.json({ ok: true })
  })

  app.get('/api/tasks', authRequired, function (req, res) {
    let rows
    if (req.query.pid) {
      rows = dbAll('SELECT * FROM tasks WHERE pid = ? ORDER BY ord', [req.query.pid])
    } else {
      rows = dbAll('SELECT * FROM tasks ORDER BY ord')
    }
    res.json({ tasks: rows.map(rowToTask) })
  })

  app.post('/api/tasks', authRequired, function (req, res) {
    const b = req.body || {}
    if (!b.pid || !b.title) return res.status(400).json({ error: '缺少必填字段' })
    const col = b.col || 'todo'
    const maxRow = dbGet('SELECT MAX(ord) AS m FROM tasks WHERE pid = ? AND col = ?', [b.pid, col])
    const ord = (maxRow && maxRow.m != null ? maxRow.m : -1) + 1
    const id = uid('t')
    dbRun('INSERT INTO tasks (id,pid,col,title,desc,priority,assignee,due,tags,ord,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [id, b.pid, col, b.title, b.desc || '', b.priority || 'medium', b.assignee || '', b.due || '',
       JSON.stringify(b.tags || []), ord, now()])
    saveDb()
    res.json({ task: rowToTask(dbGet('SELECT * FROM tasks WHERE id = ?', [id])) })
  })

  app.patch('/api/tasks/:id', authRequired, function (req, res) {
    const r = dbGet('SELECT * FROM tasks WHERE id = ?', [req.params.id])
    if (!r) return res.status(404).json({ error: '任务不存在' })
    const b = req.body || {}
    const merged = rowToTask(r)
    const keys = ['pid', 'col', 'title', 'desc', 'priority', 'assignee', 'due']
    for (let i = 0; i < keys.length; i++) {
      if (b[keys[i]] !== undefined) merged[keys[i]] = b[keys[i]]
    }
    if (b.tags !== undefined) merged.tags = b.tags
    if (b.order !== undefined) merged.order = b.order
    dbRun('UPDATE tasks SET pid=?,col=?,title=?,desc=?,priority=?,assignee=?,due=?,tags=?,ord=? WHERE id=?',
      [merged.pid, merged.col, merged.title, merged.desc, merged.priority, merged.assignee,
       merged.due, JSON.stringify(merged.tags), merged.order, r.id])
    saveDb()
    res.json({ task: rowToTask(dbGet('SELECT * FROM tasks WHERE id = ?', [r.id])) })
  })

  app.delete('/api/tasks/:id', authRequired, function (req, res) {
    dbRun('DELETE FROM tasks WHERE id = ?', [req.params.id])
    saveDb()
    res.json({ ok: true })
  })

  app.post('/api/tasks/move', authRequired, function (req, res) {
    const b = req.body || {}
    const t = dbGet('SELECT * FROM tasks WHERE id = ?', [b.id])
    if (!t) return res.status(404).json({ error: '任务不存在' })
    const col = b.col || t.col
    const index = typeof b.index === 'number' ? b.index : t.ord
    const oldCol = t.col
    const oldOrder = t.ord
    const byCol = function (c) {
      return dbAll('SELECT * FROM tasks WHERE pid = ? AND col = ? ORDER BY ord', [t.pid, c])
    }
    if (oldCol === col) {
      const siblings = byCol(col)
      for (let i = 0; i < siblings.length; i++) {
        const s = siblings[i]
        if (s.id === b.id) continue
        if (oldOrder < index && s.ord > oldOrder && s.ord < index) {
          dbRun('UPDATE tasks SET ord = ? WHERE id = ?', [s.ord - 1, s.id])
        } else if (oldOrder > index && s.ord >= index && s.ord < oldOrder) {
          dbRun('UPDATE tasks SET ord = ? WHERE id = ?', [s.ord + 1, s.id])
        }
      }
    } else {
      const oldSiblings = byCol(oldCol)
      for (let i = 0; i < oldSiblings.length; i++) {
        const s = oldSiblings[i]
        if (s.ord > oldOrder) dbRun('UPDATE tasks SET ord = ? WHERE id = ?', [s.ord - 1, s.id])
      }
      const newSiblings = byCol(col)
      for (let i = 0; i < newSiblings.length; i++) {
        const s = newSiblings[i]
        if (s.ord >= index) dbRun('UPDATE tasks SET ord = ? WHERE id = ?', [s.ord + 1, s.id])
      }
    }
    dbRun('UPDATE tasks SET col = ?, ord = ? WHERE id = ?', [col, index, b.id])
    saveDb()
    res.json({ ok: true, tasks: dbAll('SELECT * FROM tasks').map(rowToTask) })
  })

  app.use(function (err, req, res, next) {
    console.error(err)
    res.status(500).json({ error: '服务器内部错误' })
  })

  // 静态托管前端
  const distDir = process.env.DIST_DIR || path.join(__dirname, 'public')
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir))
    app.get(/^\/(?!api\/).*/, function (req, res) {
      res.sendFile(path.join(distDir, 'index.html'))
    })
    console.log('[server] serving static from ' + distDir)
  }

  const listenPort = process.env.PORT || 3000
  app.listen(listenPort, '0.0.0.0', function () {
    console.log('[server] ProjectFlow on http://0.0.0.0:' + listenPort)
  })
}

main().catch(function (e) {
  console.error('fatal:', e)
  process.exit(1)
})
