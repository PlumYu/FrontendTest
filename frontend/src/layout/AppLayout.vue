<template>
  <div class="app-layout">
    <Navbar />

    <main class="app-main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// 导入导航栏组件
import Navbar from './TheNavbar.vue'
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.app-main-content {
  flex-grow: 1;
  padding: 20px;
}
</style>
