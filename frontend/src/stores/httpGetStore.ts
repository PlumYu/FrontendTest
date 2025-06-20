// src/stores/httpGetStore.ts

import { defineStore } from 'pinia'

// 定义请求参数的接口
interface KeyValue {
  key: string
  value: string
  enabled: boolean
}

// 定义 GET 请求的状态结构
interface GetRequestState {
  url: string
  params: KeyValue[]
  headers: KeyValue[]
}

export const useHttpGetStore = defineStore('httpGet', {
  // 第一个参数是 id

  // 第二个参数是选项对象 { ... }
  state: (): { request: GetRequestState } => ({
    request: {
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      params: [{ key: '', value: '', enabled: true }],
      headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
    },
  }),

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

  // --- 最终修正：persist 配置必须是选项对象的一部分，写在同一个大括号内 ---
  persist: {
    key: 'http-get-store',
    paths: ['request'],
  },
}) // <--- defineStore 的括号在这里结束
