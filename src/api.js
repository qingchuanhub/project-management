const TOKEN_KEY = 'pf_token'

let serverMode = null

export function isServerMode() {
  return serverMode === true
}

export async function detectServer(timeoutMs = 2500) {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    const r = await fetch('/api/health', { signal: ctrl.signal })
    clearTimeout(timer)
    serverMode = r.ok
  } catch {
    serverMode = false
  }
  return serverMode
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  const token = getToken()
  if (token) headers.Authorization = 'Bearer ' + token
  const r = await fetch('/api' + path, { ...opts, headers })
  let data = null
  try { data = await r.json() } catch { /* ignore */ }
  if (!r.ok) {
    const err = new Error((data && data.error) || '请求失败 (' + r.status + ')')
    err.status = r.status
    throw err
  }
  return data
}
