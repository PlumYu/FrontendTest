<template>
  <nav class="custom-navbar" @mouseleave="resetHighlight">
    <div class="navbar-links-wrapper" ref="navbarLinksContainer">
      <router-link
        v-for="(link, index) in navLinks"
        :key="link.path"
        :to="link.path"
        class="nav-link-item"
        :ref="
          (el) => {
            if (el) navLinkElements[index] = el
          }
        "
        @mouseenter="handleMouseEnter(index)"
      >
        <span v-if="index === 0" class="logo-home-link">{{ link.text }}</span>
        <span v-else>{{ link.text }}</span>
      </router-link>
      <div class="nav-highlight" :style="highlightStyle"></div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { ElMessage, ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const navLinks = reactive([
  { text: 'HTTP', path: '/http' },
  { text: 'SSE', path: '/sse' },
  { text: 'WebSocket', path: '/websocket' },
])

const navLinkElements = ref<(InstanceType<typeof RouterLink> | null)[]>([])
const navbarLinksContainer = ref<HTMLElement | null>(null)

const highlightStyle = reactive({
  left: '0px',
  width: '0px',
  opacity: 0,
  transition: 'all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)',
})

let activeIndex = -1

const updateHighlight = (element: HTMLElement | null) => {
  if (element && navbarLinksContainer.value) {
    const containerRect = navbarLinksContainer.value.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()

    highlightStyle.left = `${elementRect.left - containerRect.left}px`
    highlightStyle.width = `${elementRect.width}px`
    highlightStyle.opacity = 1
  } else {
    highlightStyle.opacity = 0
  }
}

const handleMouseEnter = (index: number) => {
  const linkComponent = navLinkElements.value[index]
  if (linkComponent && linkComponent.$el) {
    updateHighlight(linkComponent.$el as HTMLElement)
  }
}

const resetHighlight = () => {
  setActiveHighlight()
}

const setActiveHighlight = async () => {
  await nextTick()
  // --- 以下是核心修改 ---
  // 我们将原来的 findIndex 逻辑，简化为更通用的 startsWith 判断
  activeIndex = navLinks.findIndex((link) => route.path.startsWith(link.path))

  const activeLinkComponent = navLinkElements.value[activeIndex]
  if (activeLinkComponent && activeLinkComponent.$el) {
    updateHighlight(activeLinkComponent.$el as HTMLElement)
  } else {
    highlightStyle.opacity = 0
  }
}

onMounted(() => {
  navLinkElements.value = new Array(navLinks.length).fill(null)
  nextTick(() => {
    setTimeout(setActiveHighlight, 50)
  })
})

watch(route, () => {
  setActiveHighlight()
})
</script>

<style scoped>
.custom-navbar {
  height: 60px;
  /* --- 恢复为白色背景 --- */
  background-color: #ffffff;
  /* --- 恢复浅色边框和阴影 --- */
  border-bottom: 1px solid #e7e7e7;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 25px;
}

.navbar-links-wrapper {
  flex-grow: 1;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  height: 100%;
}

.nav-link-item {
  margin: 0;
  padding: 0 20px;
  text-decoration: none;
  /* --- 恢复为深色文字 --- */
  color: #303133;
  font-size: 16px;
  transition: color 0.2s ease;
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  align-items: center;
  line-height: 60px;
}

.logo-home-link {
  font-weight: 600;
  font-size: 18px;
  /* --- Logo/首页链接文字颜色恢复 --- */
  color: #303133; /* 也可以用您的主题色，例如 #5e72e4 */
}

.nav-highlight {
  position: absolute;
  bottom: 0px;
  height: 4px;
  /* --- 高亮块颜色恢复为 Element Plus 主题蓝 --- */
  background-color: #5e72e4;
  border-radius: 2px;
  z-index: 0;
}

.nav-link-item:hover {
  /* --- Hover 颜色恢复 --- */
  color: #5e72e4;
}

.nav-link-item.router-link-exact-active {
  /* --- 激活链接颜色恢复 --- */
  color: #5e72e4;
}

.navbar-actions {
  display: flex;
  align-items: center;
}

.username-display {
  cursor: pointer;
  font-size: 15px;
  /* --- 用户名颜色恢复 --- */
  color: #606266;
  margin-right: 5px;
  display: flex;
  align-items: center;
}
.username-display .el-icon {
  /* --- 下拉箭头颜色恢复 --- */
  color: #909399; /* Element Plus 图标默认颜色 */
}
.username-display:hover,
.username-display:hover .el-icon {
  color: #5e72e4; /* Hover 时的主题色 */
}

.el-dropdown-link:focus {
  outline: none;
}

.nav-button {
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
  margin-left: 10px;
}

/* 按钮样式恢复为之前适配白色背景的版本 */
.login-button {
  background-color: #5e72e4;
  color: white;
}
.login-button:hover {
  background-color: #4a5cc0;
}

.register-button {
  background-color: #f0f2f5;
  color: #5e72e4;
  border: 1px solid #dcdfe6; /* 边框颜色调整 */
}
.register-button:hover {
  background-color: #e6e9ed;
  color: #4a5cc0;
  border-color: #c0c4cc; /* 边框颜色调整 */
}
</style>
