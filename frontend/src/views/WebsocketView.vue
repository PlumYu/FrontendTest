<template>
  <div class="ws-panel">
    <h2>WebSocket 客户端</h2>

    <div class="connection-bar">
      <FloatingInput
        class="url-input-wrapper"
        v-model="wsUrl"
        label="WebSocket URL (ws:// or wss://)"
        width="100%"
        :disabled="isConnected"
      />
      <button v-if="!isConnected" class="connect-btn" @click="connect">连接</button>
      <button v-if="isConnected" class="disconnect-btn" @click="disconnect">断开</button>
    </div>
    <div class="status-indicator">
      状态: <span :class="`status-${connectionStatus}`">{{ connectionStatus }}</span>
    </div>

    <div class="main-area">
      <div class="message-log" ref="messageLogRef">
        <div v-for="log in messageLog" :key="log.id" :class="`log-entry log-${log.type}`">
          <div class="log-bubble">
            <pre class="log-content">{{ log.content }}</pre>
          </div>
          <div class="log-timestamp">{{ log.timestamp }}</div>
        </div>
        <div v-if="messageLog.length === 0" class="log-empty">等待连接和消息...</div>
      </div>

      <div class="message-composer">
        <textarea
          v-model="messageToSend"
          placeholder="在此输入要发送的消息..."
          :disabled="!isConnected"
          @keydown.enter.prevent="sendMessage"
        ></textarea>
        <button @click="sendMessage" :disabled="!isConnected">发送</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, nextTick } from 'vue'
import { useWebsocketStore } from '../stores/websocketStore'
import FloatingInput from '../components/FloatingInput.vue'

type ConnectionStatus = 'disconnected' | 'connecting' | 'open' | 'closed' | 'error'
type MessageType = 'sent' | 'received' | 'system-info' | 'system-error'

interface LogEntry {
  id: number
  type: MessageType
  content: string
  timestamp: string
}

const wsStore = useWebsocketStore()

const connectionStatus = ref<ConnectionStatus>('disconnected')
const messageLog = ref<LogEntry[]>([])
const messageToSend = ref('')
const messageLogRef = ref<HTMLElement | null>(null)
let socket = ref<WebSocket | null>(null)

const wsUrl = computed({
  get: () => wsStore.url,
  set: (value) => wsStore.setUrl(value),
})

const isConnected = computed(() => connectionStatus.value === 'open')

const addLog = (content: string, type: MessageType) => {
  const now = new Date()
  const timestamp = `<span class="math-inline">\{now\.getHours\(\)\.toString\(\)\.padStart\(2,'0'\)\}\:</span>{now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2, '0')}`
  messageLog.value.push({
    id: now.getTime() + Math.random(),
    type,
    content,
    timestamp,
  })
  // 自动滚动到底部
  nextTick(() => {
    if (messageLogRef.value) {
      messageLogRef.value.scrollTop = messageLogRef.value.scrollHeight
    }
  })
}

const connect = () => {
  if (!wsUrl.value) return

  disconnect() // 先确保关闭旧连接
  messageLog.value = []
  addLog(`正在连接至 ${wsUrl.value}...`, 'system-info')
  connectionStatus.value = 'connecting'

  const ws = new WebSocket(wsUrl.value)
  socket.value = ws

  ws.onopen = () => {
    connectionStatus.value = 'open'
    addLog('连接成功！', 'system-info')
  }

  ws.onmessage = (event) => {
    addLog(event.data, 'received')
  }

  ws.onclose = (event) => {
    connectionStatus.value = 'closed'
    addLog(`连接已关闭。 Code: ${event.code}, Reason: ${event.reason || '无'}`, 'system-error')
    socket.value = null
  }

  ws.onerror = () => {
    connectionStatus.value = 'error'
    addLog('连接发生错误！', 'system-error')
    socket.value = null
  }
}

const disconnect = () => {
  if (socket.value) {
    socket.value.close()
  }
}

const sendMessage = () => {
  if (!isConnected.value || !messageToSend.value || !socket.value) return

  socket.value.send(messageToSend.value)
  addLog(messageToSend.value, 'sent')
  wsStore.addMessageToHistory(messageToSend.value)
  messageToSend.value = ''
}

onUnmounted(() => {
  disconnect()
})
</script>

<style scoped>
.ws-panel {
  padding: 24px;
  background-color: #ffffff;
  border-radius: 12px; /* 圆润的圆角 */
  border: 1px solid #e9ecef;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05); /* 柔和的阴影 */
  transition: all 0.3s ease;
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
  height: 20px;
}
.status-indicator .status-disconnected,
.status-indicator .status-closed {
  color: #6c757d;
}
.status-indicator .status-connecting {
  color: #ffc107;
}
.status-indicator .status-open {
  color: #28a745;
  font-weight: bold;
}
.status-indicator .status-error {
  color: #dc3545;
  font-weight: bold;
}

.main-area {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  height: 65vh;
}

.message-log {
  flex-grow: 1;
  border: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  overflow-y: auto;
  margin-bottom: 15px;
}
.log-entry {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}
.log-bubble {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 12px;
  word-wrap: break-word;
}
.log-content {
  white-space: pre-wrap;
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
}
.log-timestamp {
  font-size: 10px;
  color: #999;
  margin-top: 4px;
}

/* Sent messages (client -> server) */
.log-entry.log-sent {
  align-items: flex-end;
}
.log-entry.log-sent .log-bubble {
  background-color: #007bff;
  color: white;
}
.log-entry.log-sent .log-timestamp {
  align-self: flex-end;
}

/* Received messages (server -> client) */
.log-entry.log-received {
  align-items: flex-start;
}
.log-entry.log-received .log-bubble {
  background-color: #e9ecef;
  color: #333;
}

/* System messages */
.log-entry.log-system-info,
.log-entry.log-system-error {
  align-items: center;
}
.log-entry.log-system-info .log-bubble,
.log-entry.log-system-error .log-bubble {
  background: none;
  font-size: 12px;
  color: #6c757d;
  padding: 2px;
}
.log-entry.log-system-error .log-bubble {
  color: #dc3545;
}

.log-empty {
  color: #6c757d;
  text-align: center;
  padding-top: 20px;
}

.message-composer {
  display: flex;
  gap: 10px;
}
.message-composer textarea {
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  resize: none;
  height: 50px;
}
.message-composer button {
  padding: 0 25px;
  flex-shrink: 0;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}
.message-composer textarea:disabled,
.message-composer button:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}
</style>
