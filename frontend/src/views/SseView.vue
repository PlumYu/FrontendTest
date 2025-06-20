<template>
  <div class="sse-panel">
    <h2>Server-Sent Events (SSE)</h2>

    <div class="connection-bar">
      <FloatingInput
        class="url-input-wrapper"
        v-model="sseUrl"
        label="SSE Endpoint URL"
        width="100%"
        :disabled="connectionStatus === 'connected'"
      />
      <button v-if="connectionStatus !== 'connected'" class="connect-btn" @click="connect">
        连接
      </button>
      <button v-if="connectionStatus === 'connected'" class="disconnect-btn" @click="disconnect">
        断开
      </button>
    </div>
    <div class="status-indicator">
      状态: <span :class="`status-${connectionStatus}`">{{ connectionStatus }}</span>
    </div>

    <div class="event-listener-area">
      <div class="listener-input-group">
        <FloatingInput
          class="event-input-wrapper"
          v-model="newEventName"
          label="添加事件监听 (如 user-login)"
          width="100%"
          @keydown.enter="addCustomListener"
        />
        <button @click="addCustomListener" class="add-listener-btn">+</button>
      </div>
      <div class="listener-tags">
        <span v-for="eventName in customEvents" :key="eventName" class="listener-tag">
          {{ eventName }}
          <button @click="removeCustomListener(eventName)" class="remove-tag-btn">×</button>
        </span>
      </div>
    </div>

    <div class="output-area">
      <div class="output-header">
        <span>事件流</span>
        <button @click="clearEvents" class="clear-btn">清空</button>
      </div>
      <div class="output-log">
        <div v-for="event in receivedEvents" :key="event.id" class="log-entry">
          <span class="log-timestamp">{{ event.timestamp }}</span>
          <span class="log-event-type" :style="{ backgroundColor: getEventColor(event.type) }">{{
            event.type
          }}</span>
          <pre class="log-data">{{ event.data }}</pre>
        </div>
        <div v-if="receivedEvents.length === 0" class="log-empty">等待事件中...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, reactive } from 'vue'
import { useSseStore } from '../stores/sseStore'
import FloatingInput from '../components/FloatingInput.vue'

const sseStore = useSseStore()

// 状态
const connectionStatus = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
const receivedEvents = ref<any[]>([])
const newEventName = ref('')
let eventSourceInstance = ref<EventSource | null>(null)

// 从 Store 获取并代理数据
const sseUrl = computed({
  get: () => sseStore.url,
  set: (value) => sseStore.setUrl(value),
})
const customEvents = computed(() => sseStore.customEvents)

// 随机颜色以便区分事件
const eventColors: Record<string, string> = {}
const getEventColor = (eventType: string) => {
  if (!eventColors[eventType]) {
    const hash = eventType
      .split('')
      .reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)
    const color = `hsl(${hash % 360}, 70%, 80%)`
    eventColors[eventType] = color
  }
  return eventColors[eventType]
}

// 处理接收到的事件
const handleNewEvent = (event: MessageEvent) => {
  const now = new Date()
  const timestamp = `<span class="math-inline">\{now\.getHours\(\)\.toString\(\)\.padStart\(2,'0'\)\}\:</span>{now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2, '0')}`

  let data = event.data
  try {
    // 尝试格式化 JSON
    data = JSON.stringify(JSON.parse(event.data), null, 2)
  } catch (e) {
    // 保持原样
  }

  receivedEvents.value.unshift({
    id: now.getTime() + Math.random(), // 唯一 key
    type: event.type,
    data: data,
    timestamp: timestamp,
  })
}

const connect = () => {
  if (!sseUrl.value) {
    alert('请输入 SSE Endpoint URL')
    return
  }

  // 关闭已有连接
  if (eventSourceInstance.value) {
    eventSourceInstance.value.close()
  }

  connectionStatus.value = 'connecting'
  const eventSource = new EventSource(sseUrl.value)
  eventSourceInstance.value = eventSource

  eventSource.onopen = () => {
    connectionStatus.value = 'connected'
  }

  eventSource.onerror = (err) => {
    console.error('EventSource failed:', err)
    connectionStatus.value = 'error'
    eventSource.close()
  }

  // 监听默认的 message 事件
  eventSource.onmessage = handleNewEvent

  // 动态添加所有自定义事件监听
  customEvents.value.forEach((eventName) => {
    eventSource.addEventListener(eventName, handleNewEvent)
  })
}

const disconnect = () => {
  if (eventSourceInstance.value) {
    eventSourceInstance.value.close()
    eventSourceInstance.value = null
    connectionStatus.value = 'disconnected'
  }
}

const addCustomListener = () => {
  if (newEventName.value) {
    sseStore.addCustomEvent(newEventName.value)
    // 如果已连接，动态添加监听
    if (eventSourceInstance.value) {
      eventSourceInstance.value.addEventListener(newEventName.value, handleNewEvent)
    }
    newEventName.value = ''
  }
}

const removeCustomListener = (eventName: string) => {
  sseStore.removeCustomEvent(eventName)
  // 如果已连接，动态移除监听
  if (eventSourceInstance.value) {
    eventSourceInstance.value.removeEventListener(eventName, handleNewEvent)
  }
}

const clearEvents = () => {
  receivedEvents.value = []
}

// 组件卸载时，确保关闭连接
onUnmounted(() => {
  disconnect()
})
</script>

<style scoped>
.sse-panel {
  padding: 20px; /* 卡片内部的填充 */
  background-color: #ffffff;
  border-radius: 12px; /* 更圆润的圆角 */
  border: 1px solid #e9ecef; /* 一个淡淡的边框 */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05); /* 更柔和、自然的阴影 */
  transition: all 0.3s ease; /* 为鼠标悬浮等效果预留过渡动画 */
}

h2 {
  margin-bottom: 20px;
}

.connection-bar {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}
.url-input-wrapper {
  flex-grow: 1;
}
.connect-btn,
.disconnect-btn {
  padding: 8px 15px;
  border: none;
  color: white;
  border-radius: 4px;
  line-height: 1.5;
  cursor: pointer;
  flex-shrink: 0;
}
.connect-btn {
  background-color: #28a745;
}
.disconnect-btn {
  background-color: #dc3545;
}

.status-indicator {
  margin-top: 8px;
  font-size: 14px;
}
.status-indicator .status-disconnected {
  color: #6c757d;
}
.status-indicator .status-connecting {
  color: #ffc107;
}
.status-indicator .status-connected {
  color: #28a745;
  font-weight: bold;
}
.status-indicator .status-error {
  color: #dc3545;
  font-weight: bold;
}

.event-listener-area {
  margin-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}
.listener-input-group {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}
.event-input-wrapper {
  flex-grow: 1;
}
.add-listener-btn {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  width: 42px;
  height: 42px;
  font-size: 24px;
  cursor: pointer;
}

.listener-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.listener-tag {
  background-color: #e9ecef;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
}
.remove-tag-btn {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 16px;
  margin-left: 5px;
  padding: 0;
  line-height: 1;
}

.output-area {
  margin-top: 20px;
}
.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.output-header span {
  font-size: 18px;
  font-weight: 500;
}
.clear-btn {
  background: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
}

.output-log {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  height: 50vh;
  overflow-y: auto;
  padding: 10px;
}
.log-entry {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px;
  border-bottom: 1px solid #eee;
  font-family: 'Courier New', Courier, monospace;
}
.log-timestamp {
  color: #6c757d;
  font-size: 12px;
  flex-shrink: 0;
}
.log-event-type {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  flex-shrink: 0;
}
.log-data {
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  flex-grow: 1;
  font-size: 14px;
}
.log-empty {
  color: #6c757d;
  text-align: center;
  padding-top: 20px;
}
</style>
