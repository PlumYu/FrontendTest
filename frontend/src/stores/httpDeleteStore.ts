// src/stores/httpDeleteStore.ts

import { defineStore } from 'pinia'

interface KeyValue {
  key: string
  value: string
  enabled: boolean
}

interface DeleteRequestState {
  url: string
  params: KeyValue[]
  headers: KeyValue[]
}

// 1. 修改 defineStore 的 id 为 'httpDelete'
export const useHttpDeleteStore = defineStore('httpDelete', {
  state: (): { request: DeleteRequestState } => ({
    request: {
      // 2. 修改默认的 URL，通常指向一个要删除的资源
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      params: [],
      headers: [],
    },
  }),

  persist: {
    key: 'http-delete-store', // 3. 修改持久化的 key
    paths: ['request'],
  },

  actions: {
    setRequestUrl(url: string) {
      this.request.url = url
    },
    setParams(params: KeyValue[]) {
      this.request.params = params
    },
    setHeaders(headers: KeyValue[]) {
      this.request.headers = headers
    },
  },
})
