// src/stores/websocketStore.ts
import { defineStore } from 'pinia'

interface WebsocketState {
  url: string
  messageHistory: string[] // 存储发送过的消息历史
}

export const useWebsocketStore = defineStore('websocket', {
  state: (): WebsocketState => ({
    // 提供一个公开的 WebSocket Echo 测试服务器地址
    url: 'wss://echo.websocket.org',
    messageHistory: [],
  }),

  persist: {
    key: 'websocket-store',
    paths: ['url', 'messageHistory'],
  },

  actions: {
    setUrl(url: string) {
      this.url = url
    },
    addMessageToHistory(message: string) {
      // 只保留最近的 20 条历史记录，防止无限增长
      if (this.messageHistory.includes(message)) return
      this.messageHistory.unshift(message)
      if (this.messageHistory.length > 20) {
        this.messageHistory.pop()
      }
    },
  },
})
