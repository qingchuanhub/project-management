<script setup>
import MainLayout from '@/components/layout/MainLayout.vue'
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
  document.documentElement.classList.toggle('dark', isDark)
})
</script>

<template>
  <MainLayout />
</template>

<style>
@import './styles/main.css';

html, body, #app {
  height: 100%;
  width: 100%;
}

body {
  margin: 0;
  font-family: 'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

::selection {
  background: rgba(0, 113, 227, 0.2);
  color: var(--text-primary);
}

.dark {
  --bg-primary: #1d1d1f;
  --bg-secondary: #1d1d1f;
  --bg-tertiary: #2c2c2e;
  --glass-bg: rgba(29, 29, 31, 0.72);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
  --text-primary: #f5f5f7;
  --text-secondary: #98989d;
  --text-tertiary: #717174;
}
</style>