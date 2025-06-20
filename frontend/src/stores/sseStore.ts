// src/stores/sseStore.ts
import { defineStore } from 'pinia'

interface SseState {
  url: string
  // 存储用户想要监听的事件名称 (关键字)
  customEvents: string[]
}

export const useSseStore = defineStore('sse', {
  state: (): SseState => ({
    // 提供一个公开的测试 SSE 端点
    url: 'https://express-eventsource-demo.glitch.me/events',
    customEvents: ['user-login', 'user-logout'],
  }),

  persist: {
    key: 'sse-store',
    paths: ['url', 'customEvents'],
  },

  actions: {
    setUrl(url: string) {
      this.url = url
    },
    addCustomEvent(eventName: string) {
      if (eventName && !this.customEvents.includes(eventName)) {
        this.customEvents.push(eventName)
      }
    },
    removeCustomEvent(eventName: string) {
      const index = this.customEvents.indexOf(eventName)
      if (index > -1) {
        this.customEvents.splice(index, 1)
      }
    },
  },
})
