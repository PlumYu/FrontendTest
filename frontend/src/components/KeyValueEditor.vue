<template>
  <div class="key-value-editor">
    <div v-for="(item, index) in items" :key="index" class="kv-row">
      <input type="checkbox" v-model="item.enabled" class="kv-checkbox" />

      <FloatingInput class="kv-input-wrapper" v-model="item.key" label="Key" width="100%" />

      <FloatingInput class="kv-input-wrapper" v-model="item.value" label="Value" width="100%" />

      <button @click="removeRow(index)" class="kv-button remove-btn">-</button>
    </div>
    <button @click="addRow" class="kv-button add-btn">添加一行</button>
  </div>
</template>

<script setup lang="ts">
import FloatingInput from './FloatingInput.vue' // 1. 在这里导入你的组件

interface KeyValue {
  key: string
  value: string
  enabled: boolean
}

const items = defineModel<KeyValue[]>({ required: true })

const addRow = () => {
  items.value.push({ key: '', value: '', enabled: true })
}

const removeRow = (index: number) => {
  items.value.splice(index, 1)
}
</script>

<style scoped>
.key-value-editor {
  width: 100%;
}
.kv-row {
  display: flex;
  align-items: flex-end; /* flex-end 对齐让 FloatingInput 的下划线对齐 */
  margin-bottom: 12px; /* 增加一点行间距 */
  gap: 10px; /* 使用 gap 属性来创建元素间的间距 */
}
.kv-checkbox {
  margin-bottom: 8px; /* 微调复选框的位置 */
}

/* 2. 让 FloatingInput 的容器在 Flex 布局中伸展 */
.kv-input-wrapper {
  flex-grow: 1;
}

/* 旧的 .kv-input 样式可以删除了 */

.kv-button {
  border: none;
  color: white;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-weight: bold;
  flex-shrink: 0; /* 防止按钮被压缩 */
  margin-bottom: 2px; /* 微调按钮的位置 */
}
.remove-btn {
  background-color: #f93e3e;
}
.add-btn {
  margin-top: 10px;
  width: auto;
  padding: 6px 12px;
  background-color: #0275d8;
}
</style>
