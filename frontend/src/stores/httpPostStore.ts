// src/stores/httpPostStore.ts

import { defineStore } from 'pinia'

interface KeyValue {
  key: string
  value: string
  enabled: boolean
}

// 为 form-data 添加新的接口，因为 value 可能是文件
export interface FormDataEntry {
  key: string
  value: string | File // value 可以是字符串或文件对象
  type: 'text' | 'file' // 明确条目的类型
  enabled: boolean
}

// 升级 Post 请求的状态结构
interface PostRequestState {
  url: string
  params: KeyValue[]
  headers: KeyValue[]
  bodyType: 'json' | 'form-data' // 明确当前 body 类型
  bodyRaw: string // 用于存储 JSON 或其他原始文本
  bodyFormData: FormDataEntry[] // 用于存储 form-data
}

export const useHttpPostStore = defineStore('httpPost', {
  state: (): { request: PostRequestState } => ({
    request: {
      url: 'https://jsonplaceholder.typicode.com/posts',
      params: [],
      headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
      bodyType: 'json', // 默认类型为 json
      bodyRaw: JSON.stringify({ title: 'foo', body: 'bar', userId: 1 }, null, 2),
      bodyFormData: [{ key: '', value: '', type: 'text', enabled: true }],
    },
  }),

  persist: {
    key: 'http-post-store',
    // 注意：文件对象(File)无法被持久化，所以 bodyFormData 里的 File 会丢失
    // 这是一个已知限制，我们只持久化它的结构和文本值
  },

  actions: {
    // ... setRequestUrl, setParams, setHeaders 保持不变 ...
    setRequestUrl(url: string) {
      this.request.url = url
    },
    setParams(params: KeyValue[]) {
      this.request.params = params
    },
    setHeaders(headers: KeyValue[]) {
      this.request.headers = headers
    },

    // 新增和修改的 actions
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
