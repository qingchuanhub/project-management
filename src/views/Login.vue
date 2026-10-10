<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Eye, EyeOff, ArrowRight, Check, AlertCircle } from 'lucide-vue-next'
import { useAuthStore } from '../store'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const mode = ref('login') // login | register
const showPass = ref(false)
const loading = ref(false)
const form = ref({ name: '', email: '', password: '' })
const error = ref('')

function switchMode(m) {
  mode.value = m
  error.value = ''
}

function submit() {
  error.value = ''
  loading.value = true
  // 轻微延迟模拟请求
  setTimeout(() => {
    const r =
      mode.value === 'login'
        ? auth.login(form.value.email, form.value.password)
        : auth.register(form.value.name, form.value.email, form.value.password)
    loading.value = false
    if (r.ok) {
      const to = route.query.redirect || '/dashboard'
      router.push(String(to))
    } else {
      error.value = r.msg
    }
  }, 400)
}

function demo() {
  form.value = { name: '', email: 'demo@demo.com', password: '123456' }
}
</script>

<template>
  <div class="auth-page">
    <!-- 背景光晕 -->
    <div class="glow g1"></div>
    <div class="glow g2"></div>
    <div class="glow g3"></div>

    <div class="auth-card glass-strong">
      <div class="brand">
        <span class="mark">◆</span>
        <h1>ProjectFlow</h1>
        <p>{{ mode === 'login' ? '欢迎回来，登录继续协作' : '创建账号，开启高效项目管理' }}</p>
      </div>

      <!-- 切换标签 -->
      <div class="seg">
        <button :class="{ on: mode === 'login' }" @click="switchMode('login')">登录</button>
        <button :class="{ on: mode === 'register' }" @click="switchMode('register')">注册</button>
        <i class="seg-bar" :class="{ right: mode === 'register' }"></i>
      </div>

      <form @submit.prevent="submit" class="form">
        <transition name="fade" mode="out-in">
          <!-- 注册：姓名 -->
          <div class="field" v-if="mode === 'register'" key="name">
            <label>姓名</label>
            <input v-model="form.name" class="input" placeholder="你的名字" autocomplete="name" />
          </div>
        </transition>

        <div class="field">
          <label>邮箱</label>
          <input v-model="form.email" type="email" class="input" placeholder="you@example.com" autocomplete="email" required />
        </div>

        <div class="field">
          <label>密码</label>
          <div class="pass-wrap">
            <input
              v-model="form.password"
              :type="showPass ? 'text' : 'password'"
              class="input pass"
              :placeholder="mode === 'register' ? '至少 6 位' : '输入密码'"
              autocomplete="current-password"
              required
            />
            <button type="button" class="eye" @click="showPass = !showPass" tabindex="-1">
              <EyeOff v-if="showPass" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
        </div>

        <transition name="fade">
          <div class="err" v-if="error">
            <AlertCircle :size="14" /> {{ error }}
          </div>
        </transition>

        <button type="submit" class="btn btn-primary submit" :disabled="loading">
          <template v-if="loading"><i class="spin"></i> 请稍候…</template>
          <template v-else>
            {{ mode === 'login' ? '登录' : '创建账号' }}
            <ArrowRight :size="16" />
          </template>
        </button>
      </form>

      <div class="foot">
        <button class="demo" @click="demo">
          <Check :size="13" /> 使用演示账号（demo@demo.com / 123456）
        </button>
        <p class="tip">账号数据仅保存在你的浏览器本地</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  overflow: hidden;
  padding: 24px;
  z-index: 999;
}
/* 彩色光晕背景 */
.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.5;
  animation: float 14s ease-in-out infinite alternate;
}
.g1 { width: 420px; height: 420px; background: #0071e3; top: -120px; left: -100px; }
.g2 { width: 360px; height: 360px; background: #bf5af2; bottom: -100px; right: -80px; animation-delay: -5s; }
.g3 { width: 280px; height: 280px; background: #30d158; bottom: 30%; left: 15%; opacity: 0.3; animation-delay: -9s; }
.dark .glow { opacity: 0.35; }
@keyframes float {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(40px, -30px) scale(1.12); }
}

.auth-card {
  position: relative;
  width: 100%;
  max-width: 400px;
  border-radius: var(--r-xl);
  padding: 34px 30px;
  box-shadow: var(--shadow-lg);
  animation: cardIn 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.brand { text-align: center; margin-bottom: 24px; }
.mark {
  font-size: 34px;
  color: var(--blue);
  display: block;
  margin-bottom: 6px;
}
.brand h1 {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.6px;
}
.brand p {
  font-size: 13px;
  color: var(--text-2);
  margin-top: 5px;
}

.seg {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--bg-input);
  border-radius: var(--r-md);
  padding: 4px;
  margin-bottom: 22px;
}
.seg button {
  position: relative;
  z-index: 2;
  padding: 9px;
  background: none;
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-2);
  cursor: pointer;
  transition: color 0.2s;
}
.seg button.on { color: var(--text); }
.seg-bar {
  position: absolute;
  z-index: 1;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: var(--bg-solid);
  border-radius: 10px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}
.seg-bar.right { transform: translateX(100%); }

.field { margin-bottom: 15px; }
.field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text-2);
}
.pass-wrap { position: relative; }
.pass { padding-right: 42px; }
.eye {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-3);
  cursor: pointer;
  padding: 6px;
  display: flex;
}
.err {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--red);
  background: rgba(255, 69, 58, 0.1);
  padding: 9px 12px;
  border-radius: var(--r-sm);
  margin-bottom: 14px;
}
.submit {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  margin-top: 4px;
}
.submit:disabled { opacity: 0.7; cursor: wait; transform: none !important; }
.spin {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  display: inline-block;
  animation: rot 0.7s linear infinite;
}
@keyframes rot { to { transform: rotate(360deg); } }

.foot { margin-top: 18px; text-align: center; }
.demo {
  background: rgba(48, 209, 88, 0.12);
  color: #248a3d;
  border: none;
  border-radius: var(--r-sm);
  padding: 8px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background 0.15s;
}
.dark .demo { color: var(--green); }
.demo:hover { background: rgba(48, 209, 88, 0.22); }
.tip {
  font-size: 11px;
  color: var(--text-3);
  margin-top: 12px;
}
</style>
