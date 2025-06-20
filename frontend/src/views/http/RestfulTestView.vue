<template>
  <div class="restful-container">
    <div class="left-menu">
      <ul class="method-list">
        <router-link
          v-for="method in methods"
          :key="method.name"
          :to="`/http/${method.name.toLowerCase()}`"
          custom
          v-slot="{ navigate, isActive }"
        >
          <li
            :class="['menu-item', method.name.toLowerCase(), { active: isActive }]"
            @click="navigate"
          >
            <span class="method-name">{{ method.name }}</span>
          </li>
        </router-link>
      </ul>
    </div>
    <div class="right-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 1. 定义接口（使用 TypeScript 的好处）
interface HttpMethod {
  name: 'GET' | 'POST' | 'PUT' | 'DELETE'
  color: string
}

// 2. 创建菜单列表数据
// 我们将颜色和方法名绑定在一起，方便管理
const methods: HttpMethod[] = [
  { name: 'GET', color: '#49cc90' }, // 鲜明的绿色
  { name: 'POST', color: '#fca130' }, // 温暖的橙色
  { name: 'PUT', color: '#61affe' }, // 清爽的蓝色
  { name: 'DELETE', color: '#f93e3e' }, // 明确的红色
]

// 3. 追踪当前选中的方法，默认为 'GET'
const activeMethod = ref<string>('GET')

// 4. 定义点击菜单项时触发的函数
const selectMethod = (methodName: string) => {
  activeMethod.value = methodName
  // 在这里你可以添加其他逻辑，例如加载对应方法的默认模板等
}

// 5. 创建一个计算属性，用于获取当前选中方法的颜色
const activeMethodColor = computed(() => {
  return methods.find((m) => m.name === activeMethod.value)?.color || '#000'
})
</script>

<style scoped>
/* 使用 Flexbox 构建左右分栏布局 */
.restful-container {
  display: flex;
  height: calc(100vh - 100px); /* 假设顶部导航栏高度为100px，可以根据实际情况调整 */
  border-top: 1px solid #e0e0e0;
}

/* 左侧菜单栏样式 */
.left-menu {
  width: 200px;
  background-color: #fafafa;
  border-right: 1px solid #e0e0e0;
  flex-shrink: 0; /* 防止菜单栏被压缩 */
}

.method-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  padding: 12px 20px;
  cursor: pointer;
  font-weight: bold;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  transition: all 0.2s ease-in-out;
  color: #333;
  border-left: 4px solid transparent; /* 未选中时透明边框占位 */
}

.menu-item:hover {
  background-color: #f0f0f0;
}

/* --- 核心：动态高亮颜色 --- */
/* 为每种方法定义激活状态的样式 */
.menu-item.get.active {
  background-color: #e8f5e9;
  border-left-color: #49cc90;
  color: #2e7d32;
}

.menu-item.post.active {
  background-color: #fff3e0;
  border-left-color: #fca130;
  color: #e65100;
}

.menu-item.put.active {
  background-color: #e3f2fd;
  border-left-color: #61affe;
  color: #0d47a1;
}

.menu-item.delete.active {
  background-color: #ffebee;
  border-left-color: #f93e3e;
  color: #b71c1c;
}

/* 右侧内容框样式 */
.right-content {
  flex-grow: 1; /* 占据所有剩余空间 */
  padding: 20px;
  background-color: #fff;
  overflow-y: auto; /* 如果内容超长，则显示滚动条 */
}

.content-box {
  /* 你可以在这里为内容区域添加样式 */
}
</style>
