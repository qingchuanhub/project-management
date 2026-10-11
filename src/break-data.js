// ============ Break UI: 最坏数据 Fixture & Toggle ============
// 基于 emilkowalski/skills 的 break-ui skill
// 包含：长名字、长邮箱、单字母名字、缺失字段、巨大计数、空列表、长标签、非拉丁文本、emoji、极端数字

export const worstCaseData = {
  // 用户 - 各种边界情况
  users: [
    { id: 'u1', name: '林青川', email: 'qingchuan@team.com', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=lin', role: 'admin', status: 'online' },
    { id: 'u2', name: 'Sarah Chen', email: 'sarah@team.com', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=sarah', role: 'member', status: 'online' },
    { id: 'u3', name: 'Mike Wu', email: 'mike@team.com', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=mike', role: 'member', status: 'away' },
    { id: 'u4', name: 'Emily Zhang', email: 'emily@team.com', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=emily', role: 'member', status: 'offline' },
    { id: 'u5', name: 'David Lin', email: 'david@team.com', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=david', role: 'member', status: 'busy' },
    // 最坏情况用户
    { id: 'u-wc1', name: 'Aleksandra Wiśniewska-Kowalczyk', email: 'aleksandra.wisniewska-kowalczyk@northwind-industries-holdings.example.com', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=aleksandra', role: 'admin', status: 'online' },
    { id: 'u-wc2', name: 'Jo', email: 'jo@x.com', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=jo', role: 'member', status: 'away' },
    { id: 'u-wc3', name: 'Bartholomew Fitzgerald', email: 'bartholomew.fitzgerald@northwind-industries-holdings.example.com', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=bartholomew', role: 'member', status: 'offline' },
    { id: 'u-wc4', name: '山田太郎', email: 'yamada@company.jp', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=yamada', role: 'member', status: 'busy' },
    { id: 'u-wc5', name: '🌟Super User🌟', email: 'super.user@emoji-test.example.com', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=super', role: 'admin', status: 'online' },
    { id: 'u-wc6', name: 'Bartholomew Fitzger ald III', email: 'bartholomew.fitzgerald3@very-long-domain-name-that-exceeds-normal-length.example.com', avatar: '', role: 'member', status: 'away' }, // 无头像
  ],

  // 项目 - 各种边界情况
  projects: [
    { id: 'p1', name: 'Project Alpha', desc: '核心产品重构与体验升级', status: 'active', progress: 68, start: '2026-07-01', end: '2026-11-30', color: '#0071e3', icon: '🚀', members: ['1', '2', '3'], tags: ['产品', '重构'] },
    { id: 'p2', name: '移动端 App 2.0', desc: '全新架构的跨平台移动应用', status: 'active', progress: 35, start: '2026-08-15', end: '2026-12-31', color: '#30d158', icon: '📱', members: ['2', '4'], tags: ['移动端'] },
    { id: 'p3', name: 'API 网关迁移', desc: '迁移至微服务架构，提升可用性', status: 'planning', progress: 12, start: '2026-09-01', end: '2027-02-28', color: '#ff9f0a', icon: '⚙️', members: ['1', '3', '5'], tags: ['后端', '架构'] },
    { id: 'p4', name: '设计系统 v3', desc: '统一多端设计语言与组件库', status: 'completed', progress: 100, start: '2026-03-01', end: '2026-06-30', color: '#bf5af2', icon: '🎨', members: ['4'], tags: ['设计'] },
    // 最坏情况项目
    { id: 'p-wc1', name: 'Project with an Extremely Long Name That Exceeds Normal UI Constraints', desc: 'This project has an extremely long description that will test how the UI handles text wrapping, truncation, and overflow in various container widths. It contains many words and should definitely overflow in narrow containers.', status: 'active', progress: 42, start: '2026-01-01', end: '2099-12-31', color: '#ff9f0a', icon: '📦', members: ['u-wc1', 'u-wc2', 'u-wc3', 'u-wc4', 'u-wc5', 'u-wc6', '1', '2', '3', '4', '5'], tags: ['超长标签测试', 'Overflow Test', 'Long Tag Name That Exceeds Normal', 'Another Very Long Tag Name', 'Tag With Unicode: 测试标签', 'Another: اختبار'] },
    { id: 'p-wc2', name: 'P', desc: '', status: 'planning', progress: 0, start: '', end: '', color: '#30d158', icon: '📦', members: [], tags: [] }, // 单字母名字，空描述
    { id: 'p-wc3', name: 'Project with 1,284 Members', desc: 'A project with a huge member count to test number formatting and avatar stacks', status: 'active', progress: 15, start: '2026-01-01', end: '2026-12-31', color: '#bf5af2', icon: '👥', members: Array.from({length: 1284}, (_, i) => `m${i}`), tags: ['大团队', '性能测试'] },
    { id: 'p-wc4', name: '空项目 - 无成员无任务', desc: '', status: 'planning', progress: 0, start: '', end: '', color: '#ff453a', icon: '🗑️', members: [], tags: [] }, // 空项目
  ],

  // 任务 - 各种边界情况
  tasks: [
    { id: 't1', pid: 'p1', col: 'todo', title: '设计新版仪表盘布局', desc: '完成线框图与高保真视觉稿', priority: 'high', assignee: '1', due: '2026-10-25', tags: ['设计'], order: 0 },
    { id: 't2', pid: 'p1', col: 'todo', title: '编写接口文档', desc: '覆盖全部 REST 端点', priority: 'medium', assignee: '3', due: '2026-10-20', tags: ['文档'], order: 1 },
    { id: 't3', pid: 'p1', col: 'doing', title: '实现 OAuth 登录流程', desc: '接入 GitHub 与 Google 第三方登录', priority: 'high', assignee: '2', due: '2026-10-18', tags: ['后端', '认证'], order: 0 },
    { id: 't4', pid: 'p1', col: 'doing', title: '暗色模式适配', desc: '全部页面适配深色主题', priority: 'medium', assignee: '4', due: '2026-10-22', tags: ['前端'], order: 1 },
    { id: 't5', pid: 'p1', col: 'review', title: 'CI/CD 流水线搭建', desc: 'GitHub Actions 自动测试与部署', priority: 'medium', assignee: '5', due: '2026-10-15', tags: ['DevOps'], order: 0 },
    { id: 't6', pid: 'p1', col: 'done', title: '项目脚手架初始化', desc: 'Vite + Vue 3 基础工程', priority: 'high', assignee: '1', due: '2026-10-10', tags: ['工程化'], order: 0 },
    // 最坏情况任务
    { id: 't-wc1', pid: 'p-wc1', col: 'todo', title: 'Task with an Extremely Long Title That Will Definitely Overflow In Narrow Columns And Test Truncation Logic', desc: 'This task has an extremely long description that contains many words and special characters to test how the UI handles text wrapping, truncation, and overflow in various container widths. It contains emoji 🎉🚀💯, unicode: 测试内容، اختبار، テスト、테스트, and very long URLs like https://very-long-domain-name.example.com/path/that/is/very/long/and/contains/many/segments', priority: 'high', assignee: 'u-wc1', due: '2026-12-31', tags: ['超长标签', 'Overflow Test', 'Long Tag That Exceeds Normal Width', 'Another Very Long Tag', 'Unicode: 测试'], order: 0 },
    { id: 't-wc2', pid: 'p-wc1', col: 'todo', title: 'T', desc: '', priority: 'low', assignee: '', due: '', tags: [], order: 1 }, // 单字母标题，无描述，无分配，无截止日期
    { id: 't-wc3', pid: 'p-wc1', col: 'doing', title: 'Task with extremely long assignee name that will test avatar truncation and name overflow', desc: '', priority: 'high', assignee: 'u-wc1', due: '2026-12-31', tags: ['assignee-test'], order: 0 },
    { id: 't-wc4', pid: 'p-wc1', col: 'review', title: 'Task with huge tag count', desc: '', priority: 'medium', assignee: 'u-wc2', due: '2026-12-31', tags: Array.from({length: 20}, (_, i) => `tag-${i}-with-long-name`), order: 0 }, // 20个标签
    { id: 't-wc5', pid: 'p-wc2', col: 'todo', title: '单任务项目', desc: '', priority: 'medium', assignee: 'u-wc2', due: '2026-12-31', tags: [], order: 0 }, // 单任务
    { id: 't-wc6', pid: 'p-wc1', col: 'done', title: '已完成任务 - 测试计数为1', desc: '', priority: 'high', assignee: '1', due: '2026-10-10', tags: ['完成'], order: 0 }, // 测试复数形式
    { id: 't-wc7', pid: 'p-wc1', col: 'todo', title: 'Task with NaN and edge numbers', desc: 'Amount: NaN, Count: undefined, Progress: Infinity', priority: 'high', assignee: '1', due: '2026-12-31', tags: [], order: 0 }, // 边缘数字
    { id: 't-wc8', pid: 'p-wc1', col: 'todo', title: 'Task with <script>alert("xss")</script> and & unescaped HTML', desc: 'Raw HTML: <b>bold</b> & entities', priority: 'high', assignee: '1', due: '2026-12-31', tags: ['xss-test'], order: 0 }, // XSS测试
    { id: 't-wc9', pid: 'p-wc1', col: 'todo', title: 'Very long email in assignee context: bartholomew.fitzgerald@northwind-industries-holdings.example.com', desc: '', priority: 'medium', assignee: 'u-wc3', due: '2026-12-31', tags: ['email-overflow'], order: 0 }, // 长邮箱在任务中
    { id: 't-wc10', pid: 'p-wc1', col: 'doing', title: 'RTL test: اختبار المحتوى بالعربية', desc: 'Vietnamese: Nội dung tiếng Việt. Thai: เนื้อหาภาษาไทย. Chinese: 中文内容。', priority: 'high', assignee: 'u-wc4', due: '2026-12-31', tags: ['rtl', 'i18n'], order: 0 }, // 多语言
  ],
}

// Demo data (kind data for comparison)
export const demoData = {
  users: [
    { id: '1', name: '林青川', email: 'qingchuan@team.com', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=lin', role: 'admin', status: 'online' },
    { id: '2', name: 'Sarah Chen', email: 'sarah@team.com', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=sarah', role: 'member', status: 'online' },
    { id: '3', name: 'Mike Wu', email: 'mike@team.com', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=mike', role: 'member', status: 'away' },
    { id: '4', name: 'Emily Zhang', email: 'emily@team.com', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=emily', role: 'member', status: 'offline' },
    { id: '5', name: 'David Lin', email: 'david@team.com', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=david', role: 'member', status: 'busy' }
  ],
  projects: [
    { id: 'p1', name: 'Project Alpha', desc: '核心产品重构与体验升级', status: 'active', progress: 68, start: '2026-07-01', end: '2026-11-30', color: '#0071e3', icon: '🚀', members: ['1', '2', '3'], tags: ['产品', '重构'] },
    { id: 'p2', name: '移动端 App 2.0', desc: '全新架构的跨平台移动应用', status: 'active', progress: 35, start: '2026-08-15', end: '2026-12-31', color: '#30d158', icon: '📱', members: ['2', '4'], tags: ['移动端'] },
    { id: 'p3', name: 'API 网关迁移', desc: '迁移至微服务架构，提升可用性', status: 'planning', progress: 12, start: '2026-09-01', end: '2027-02-28', color: '#ff9f0a', icon: '⚙️', members: ['1', '3', '5'], tags: ['后端', '架构'] },
    { id: 'p4', name: '设计系统 v3', desc: '统一多端设计语言与组件库', status: 'completed', progress: 100, start: '2026-03-01', end: '2026-06-30', color: '#bf5af2', icon: '🎨', members: ['4'], tags: ['设计'] }
  ],
  tasks: [
    { id: 't1', pid: 'p1', col: 'todo', title: '设计新版仪表盘布局', desc: '完成线框图与高保真视觉稿', priority: 'high', assignee: '1', due: '2026-10-25', tags: ['设计'], order: 0 },
    { id: 't2', pid: 'p1', col: 'todo', title: '编写接口文档', desc: '覆盖全部 REST 端点', priority: 'medium', assignee: '3', due: '2026-10-20', tags: ['文档'], order: 1 },
    { id: 't3', pid: 'p1', col: 'doing', title: '实现 OAuth 登录流程', desc: '接入 GitHub 与 Google 第三方登录', priority: 'high', assignee: '2', due: '2026-10-18', tags: ['后端', '认证'], order: 0 },
    { id: 't4', pid: 'p1', col: 'doing', title: '暗色模式适配', desc: '全部页面适配深色主题', priority: 'medium', assignee: '4', due: '2026-10-22', tags: ['前端'], order: 1 },
    { id: 't5', pid: 'p1', col: 'review', title: 'CI/CD 流水线搭建', desc: 'GitHub Actions 自动测试与部署', priority: 'medium', assignee: '5', due: '2026-10-15', tags: ['DevOps'], order: 0 },
    { id: 't6', pid: 'p1', col: 'done', title: '项目脚手架初始化', desc: 'Vite + Vue 3 基础工程', priority: 'high', assignee: '1', due: '2026-10-10', tags: ['工程化'], order: 0 },
    { id: 't7', pid: 'p2', col: 'todo', title: '新用户引导流程', desc: '设计并实现移动端引导页', priority: 'high', assignee: '4', due: '2026-11-05', tags: ['设计'], order: 0 },
    { id: 't8', pid: 'p2', col: 'doing', title: '推送通知服务', desc: '集成 FCM 实现消息推送', priority: 'medium', assignee: '2', due: '2026-11-15', tags: ['后端'], order: 0 },
    { id: 't9', pid: 'p3', col: 'todo', title: '服务网格配置', desc: '部署 Istio 流量治理', priority: 'high', assignee: '5', due: '2026-11-01', tags: ['架构'], order: 0 },
    { id: 't10', pid: 'p3', col: 'doing', title: '分布式限流实现', desc: '基于 Redis 的全局限流', priority: 'medium', assignee: '1', due: '2026-10-30', tags: ['后端'], order: 0 },
    { id: 't11', pid: 'p4', col: 'done', title: '色板与设计令牌', desc: '定义语义化色彩变量', priority: 'high', assignee: '4', due: '2026-06-01', tags: ['设计'], order: 0 },
    { id: 't12', pid: 'p4', col: 'done', title: '组件库 v1.0', desc: '核心组件开发与文档', priority: 'high', assignee: '2', due: '2026-06-25', tags: ['前端'], order: 1 }
  ]
}

// Data modes for the toggle
export const DATA_MODES = ['demo', 'worst', 'empty', 'one', 'thousand']

// Empty data
export const emptyData = { users: [], projects: [], tasks: [] }

// One item data
export const oneData = {
  users: [{ id: '1', name: 'Solo User', email: 'solo@test.com', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=solo', role: 'member', status: 'online' }],
  projects: [{ id: 'p1', name: 'Single Project', desc: 'Only one project', status: 'active', progress: 50, start: '2026-01-01', end: '2026-12-31', color: '#0071e3', icon: '📦', members: ['1'], tags: ['single'] }],
  tasks: [{ id: 't1', pid: 'p1', col: 'todo', title: 'Single Task', desc: 'Only one task', priority: 'medium', assignee: '1', due: '2026-12-31', tags: ['single'], order: 0 }]
}

// Thousand items (for performance test)
export const thousandData = {
  users: Array.from({length: 1000}, (_, i) => ({ id: `u${i}`, name: `User ${i}`, email: `user${i}@test.com`, avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=user${i}`, role: 'member', status: 'online' })),
  projects: Array.from({length: 100}, (_, i) => ({ id: `p${i}`, name: `Project ${i}`, desc: `Project ${i} description`, status: 'active', progress: i % 100, start: '2026-01-01', end: '2026-12-31', color: '#0071e3', icon: '📦', members: [], tags: [] })),
  tasks: Array.from({length: 1000}, (_, i) => ({ id: `t${i}`, pid: `p${i % 100}`, col: ['todo', 'doing', 'review', 'done'][i % 4], title: `Task ${i}`, desc: `Task ${i} description`, priority: ['low', 'medium', 'high'][i % 3], assignee: `u${i % 1000}`, due: '2026-12-31', tags: [], order: i }))
}

// Helper to get data by mode
export function getDataByMode(mode) {
  switch (mode) {
    case 'demo': return demoData
    case 'worst': return worstCaseData
    case 'empty': return emptyData
    case 'one': return oneData
    case 'thousand': return thousandData
    default: return demoData
  }
}

// Pluralization helper using Intl.PluralRules
export function pluralize(count, singular, plural) {
  if (count === 1) return `${count} ${singular}`
  return `${count} ${plural}`
}

// Format number with user locale
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '—'
  return new Intl.NumberFormat().format(num)
}

// Truncate with middle ellipsis for emails/paths
export function truncateMiddle(str, maxLen = 40) {
  if (str.length <= maxLen) return str
  const keep = Math.floor((maxLen - 3) / 2)
  return str.slice(0, keep) + '…' + str.slice(-keep)
}

// Safe initials from name (handles emoji, unicode, single names)
export function getInitials(name) {
  if (!name) return '?'
  // Split by grapheme clusters for proper emoji handling
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
  const graphemes = [...segmenter.segment(name)].map(s => s.segment)
  
  // First try: split by space and take first + last word initials
  const words = name.trim().split(/\s+/).filter(w => w.length > 0)
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  }
  if (words.length === 1) {
    const word = words[0]
    if (word.length >= 2) return (word[0] + word[word.length - 1]).toUpperCase()
    return word[0].toUpperCase()
  }
  // Fallback: first grapheme
  return graphemes[0]?.toUpperCase() || '?'
}

// Safe avatar fallback
export function getAvatarUrl(seed, fallbackName) {
  if (!seed) return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(fallbackName || 'unknown')}`
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}`
}

// Tabular numbers class helper
export function tabularNums(value) {
  return `<span class="stat-value">${formatNumber(value)}</span>`
}