<template>
  <div class="method-panel">
    <div class="request-area">
      <div class="url-bar">
        <span class="method-tag get">GET</span>
        <FloatingInput
          class="url-input-wrapper"
          v-model="requestUrl"
          label="请求地址"
          width="100%"
        />
        <button class="send-button" @click="sendRequest" :disabled="loading">
          {{ loading ? '发送中...' : '发送' }}
        </button>
      </div>

      <div class="params-tabs">
        <div class="tab-header">
          <button
            v-for="(tab, index) in requestTabs"
            :key="tab"
            :ref="
              (el) => {
                if (el) requestTabButtonRefs[index] = el as HTMLButtonElement
              }
            "
            :class="{ active: activeRequestTab === tab }"
            @click="activeRequestTab = tab"
          >
            {{ tab }}
          </button>
          <div class="tab-underline" :style="requestUnderlineStyle"></div>
        </div>
        <div class="tab-content">
          <div v-show="activeRequestTab === 'Query Params'">
            <KeyValueEditor v-model="requestParams" />
          </div>
          <div v-show="activeRequestTab === 'Headers'">
            <KeyValueEditor v-model="requestHeaders" />
          </div>
        </div>
      </div>
    </div>

    <div class="response-area" v-if="response">
      <h3>响应</h3>
      <div class="response-meta">
        <span
          >状态:
          <span :class="`status-${String(response.status)[0]}`">{{ response.status }}</span></span
        >
        <span
          >耗时: <span>{{ response.time }} ms</span></span
        >
      </div>
      <div class="tab-header">
        <button
          v-for="(tab, index) in responseTabs"
          :key="tab"
          :ref="
            (el) => {
              if (el) responseTabButtonRefs[index] = el as HTMLButtonElement
            }
          "
          :class="{ active: activeResponseTab === tab }"
          @click="activeResponseTab = tab"
        >
          {{ tab }}
        </button>
        <div class="tab-underline" :style="responseUnderlineStyle"></div>
      </div>
      <div class="tab-content">
        <div v-show="activeResponseTab === 'body'">
          <pre class="response-body">{{ formattedResponseBody }}</pre>
        </div>
        <div v-show="activeResponseTab === 'headers'">
          <pre class="response-body">{{ formattedResponseHeaders }}</pre>
        </div>
      </div>
    </div>
    <div class="response-area" v-else-if="!response && hasBeenSent">
      <p>请求失败或无响应。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import KeyValueEditor from '../../components/KeyValueEditor.vue'
import FloatingInput from '../../components/FloatingInput.vue'
import axios from 'axios'
import { useHttpGetStore } from '../../stores/httpGetStore'

// --- 使用 Pinia Store ---
const httpGetStore = useHttpGetStore()

// --- 代理计算属性，确保通过 Action 更新 Store ---
const requestUrl = computed({
  get: () => httpGetStore.request.url,
  set: (value) => httpGetStore.setRequestUrl(value),
})
const requestParams = computed({
  get: () => httpGetStore.request.params,
  set: (value) => httpGetStore.setParams(value),
})
const requestHeaders = computed({
  get: () => httpGetStore.request.headers,
  set: (value) => httpGetStore.setHeaders(value),
})

// --- 动画 Tab 逻辑 (请求部分) ---
const requestTabs = ['Query Params', 'Headers']
const activeRequestTab = ref(requestTabs[0])
const requestTabButtonRefs = ref<HTMLButtonElement[]>([])
const requestUnderlineStyle = ref({ width: '0px', transform: 'translateX(0px)', opacity: 0 })
const updateRequestUnderline = () => {
  const activeIndex = requestTabs.indexOf(activeRequestTab.value)
  const activeButton = requestTabButtonRefs.value[activeIndex]
  if (activeButton) {
    requestUnderlineStyle.value = {
      width: `${activeButton.offsetWidth}px`,
      transform: `translateX(${activeButton.offsetLeft}px)`,
      opacity: 1,
    }
  }
}
watch(activeRequestTab, () => nextTick(updateRequestUnderline))

// --- 动画 Tab 逻辑 (响应部分) ---
const responseTabs = ['Body', 'Headers']
const activeResponseTab = ref(responseTabs[0])
const responseTabButtonRefs = ref<HTMLButtonElement[]>([])
const responseUnderlineStyle = ref({ width: '0px', transform: 'translateX(0px)', opacity: 0 })
const updateResponseUnderline = () => {
  const activeIndex = responseTabs.indexOf(activeResponseTab.value)
  const activeButton = responseTabButtonRefs.value[activeIndex]
  if (activeButton) {
    responseUnderlineStyle.value = {
      width: `${activeButton.offsetWidth}px`,
      transform: `translateX(${activeButton.offsetLeft}px)`,
      opacity: 1,
    }
  }
}
watch(activeResponseTab, () => nextTick(updateResponseUnderline))

// --- 响应状态 ---
const loading = ref(false)
const hasBeenSent = ref(false)
const response = ref<any>(null)

// --- onMounted ---
onMounted(() => {
  setTimeout(() => {
    updateRequestUnderline()
    if (response.value) {
      updateResponseUnderline()
    }
  }, 100)
})

// --- Computed Properties ---
const formattedResponseBody = computed(() => {
  if (!response.value?.data) return 'No Content'
  try {
    return JSON.stringify(response.value.data, null, 2)
  } catch (e) {
    return response.value.data
  }
})
const formattedResponseHeaders = computed(() => {
  if (!response.value?.headers) return ''
  return JSON.stringify(response.value.headers, null, 2)
})

// --- 发送请求 ---
const sendRequest = async () => {
  loading.value = true
  response.value = null
  hasBeenSent.value = true
  const startTime = Date.now()
  try {
    const finalUrl = new URL(httpGetStore.request.url)
    httpGetStore.request.params.forEach((param) => {
      if (param.enabled && param.key) {
        finalUrl.searchParams.append(param.key, param.value)
      }
    })
    const headers: Record<string, string> = {}
    httpGetStore.request.headers.forEach((header) => {
      if (header.enabled && header.key) {
        headers[header.key] = header.value
      }
    })
    const res = await axios.get(finalUrl.toString(), { headers })
    response.value = {
      status: res.status,
      data: res.data,
      headers: res.headers,
      time: Date.now() - startTime,
    }
  } catch (error: any) {
    if (error.response) {
      response.value = {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        time: Date.now() - startTime,
      }
    } else {
      response.value = {
        status: 'Error',
        data: { message: error.message },
        headers: {},
        time: Date.now() - startTime,
      }
    }
    console.error('API Request Error:', error)
  } finally {
    loading.value = false
    nextTick(updateResponseUnderline)
  }
}
</script>

<style scoped>
.method-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.request-area {
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}
.url-bar {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.method-tag {
  padding: 8px 12px;
  font-weight: bold;
  color: white;
  border-radius: 4px;
  line-height: 1.5;
  flex-shrink: 0;
  box-sizing: border-box;
}
.method-tag.get {
  background-color: #49cc90;
}
.url-input-wrapper {
  flex-grow: 1;
}
.send-button {
  padding: 8px 15px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  line-height: 1.5;
  flex-shrink: 0;
  box-sizing: border-box;
}
.send-button:disabled {
  background-color: #aaa;
}
.params-tabs,
.response-area {
  margin-top: 15px;
}
.tab-header {
  position: relative;
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}
.tab-header button {
  padding: 10px 15px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 15px;
  color: #606266;
  font-weight: 500;
  transition: color 0.3s ease;
  z-index: 1;
}
.tab-header button.active {
  color: #007bff;
}
.tab-underline {
  position: absolute;
  bottom: -1px;
  left: 0;
  height: 2px;
  background-color: #007bff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.tab-content {
  padding-top: 15px;
}
.response-meta {
  margin-bottom: 10px;
}
.response-meta span {
  margin-right: 20px;
  font-size: 14px;
}
.response-meta .status-2 {
  color: #28a745;
  font-weight: bold;
}
.response-meta .status-4,
.response-meta .status-5 {
  color: #dc3545;
  font-weight: bold;
}
.response-body {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 40vh;
  overflow-y: auto;
  font-family: 'Courier New', Courier, monospace;
}
</style>
