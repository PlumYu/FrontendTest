// src/stores/httpPutStore.ts

import { defineStore } from 'pinia'
import type { FormDataEntry, KeyValue } from './httpPostStore' // 我们可以从 Post store 导入类型

// PUT 请求的状态结构和 POST 完全一样
interface PutRequestState {
  url: string
  params: KeyValue[]
  headers: KeyValue[]
  bodyType: 'json' | 'form-data'
  bodyRaw: string
  bodyFormData: FormDataEntry[]
}

// 1. 修改 defineStore 的 id 为 'httpPut'
export const useHttpPutStore = defineStore('httpPut', {
  state: (): { request: PutRequestState } => ({
    request: {
      // 2. 修改默认的 URL，通常指向一个具体的资源
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      params: [],
      headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
      bodyType: 'json',
      // 3. 修改默认的 body，通常包含资源的 id
      body: JSON.stringify(
        {
          id: 1,
          title: 'foo',
          body: 'bar',
          userId: 1,
        },
        null,
        2,
      ),
      bodyFormData: [{ key: '', value: '', type: 'text', enabled: true }],
    },
  }),

  persist: {
    key: 'http-put-store', // 4. 修改持久化的 key
    paths: ['request'],
  },

  // 5. Actions 的名字和逻辑完全一样，无需修改
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
    setBodyType(type: 'json' | 'form-data') {
      this.request.bodyType = type
    },
    setBodyRaw(body: string) {
      this.request.bodyRaw = body
    },
    setBodyFormData(formData: FormDataEntry[]) {
      this.request.bodyFormData = formData
    },
  },
})
