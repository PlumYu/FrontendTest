<template>
  <div class="method-panel">
    <div class="request-area">
      <div class="url-bar">
        <span class="method-tag put">PUT</span>
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
          <div v-show="activeRequestTab === 'Body'">
            <div class="body-type-selector">
              <label><input type="radio" value="json" v-model="requestBodyType" /> JSON</label>
              <label
                ><input type="radio" value="form-data" v-model="requestBodyType" /> form-data</label
              >
            </div>
            <div class="body-editor-area">
              <textarea
                v-if="requestBodyType === 'json'"
                class="body-editor"
                v-model="requestBodyRaw"
              ></textarea>
              <div v-if="requestBodyType === 'form-data'" class="form-data-editor">
                <div v-for="(item, index) in requestBodyFormData" :key="index" class="kv-row">
                  <input type="checkbox" v-model="item.enabled" class="kv-checkbox" />
                  <FloatingInput
                    class="kv-input-wrapper"
                    v-model="item.key"
                    label="Key"
                    width="100%"
                  />
                  <select v-model="item.type" @change="onTypeChange(index)" class="kv-select">
                    <option value="text">Text</option>
                    <option value="file">File</option>
                  </select>
                  <div class="kv-input-wrapper">
                    <FloatingInput
                      v-if="item.type === 'text'"
                      v-model="item.value"
                      label="Value"
                      width="100%"
                    />
                    <div v-if="item.type === 'file'" class="file-input-container">
                      <label
                        v-if="!item.value || typeof item.value === 'string'"
                        :for="`file-input-${index}`"
                        class="file-input-label"
                        >选择文件</label
                      >
                      <div v-else class="file-display">
                        <span class="file-name">{{ (item.value as File).name }}</span
                        ><button @click="clearFile(index)" class="clear-file-btn">×</button>
                      </div>
                      <input
                        type="file"
                        :id="`file-input-${index}`"
                        @change="handleFileChange($event, index)"
                        style="display: none"
                      />
                    </div>
                  </div>
                  <button @click="removeFormDataRow(index)" class="kv-button remove-btn">-</button>
                </div>
                <button @click="addFormDataRow" class="kv-button add-btn">添加一行</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="uploadState.isUploading || uploadState.isSuccess" class="upload-status-container">
      <div v-if="uploadState.isUploading" class="upload-progress-card">
        <div class="progress-info">
          <span class="progress-text">正在上传...</span
          ><span class="progress-percent">{{ uploadState.progress }}%</span>
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" :style="{ width: uploadState.progress + '%' }"></div>
        </div>
      </div>
      <div v-if="uploadState.isSuccess" class="upload-success-card">
        <span class="success-text">上传完成</span><span class="success-checkmark">✔</span>
      </div>
    </div>
    <div class="response-area" v-if="response">
      <h3>响应</h3>
      <div class="response-meta">
        <span
          >状态:
          <span :class="`status-${String(response.status)[0]}`">{{ response.status }}</span></span
        ><span
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
    <div class="response-area" v-else-if="!response && hasBeenSent"><p>请求失败或无响应。</p></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, reactive } from 'vue'
import KeyValueEditor from '../../components/KeyValueEditor.vue'
import FloatingInput from '../../components/FloatingInput.vue'
import axios from 'axios'
import { useHttpPutStore, type FormDataEntry } from '../../stores/httpPutStore'

// --- 使用 PUT Store ---
const httpPutStore = useHttpPutStore()

// --- 代理计算属性 ---
const requestUrl = computed({
  get: () => httpPutStore.request.url,
  set: (v) => httpPutStore.setRequestUrl(v),
})
const requestParams = computed({
  get: () => httpPutStore.request.params,
  set: (v) => httpPutStore.setParams(v),
})
const requestHeaders = computed({
  get: () => httpPutStore.request.headers,
  set: (v) => httpPutStore.setHeaders(v),
})
const requestBodyType = computed({
  get: () => httpPutStore.request.bodyType,
  set: (v) => httpPutStore.setBodyType(v as 'json' | 'form-data'),
})
const requestBodyRaw = computed({
  get: () => httpPutStore.request.bodyRaw,
  set: (v) => httpPutStore.setBodyRaw(v),
})
const requestBodyFormData = computed({
  get: () => httpPutStore.request.bodyFormData,
  set: (value) => httpPutStore.setBodyFormData(value),
})

// --- form-data 行操作方法 ---
const addFormDataRow = () => {
  const newRow: FormDataEntry = { key: '', value: '', type: 'text', enabled: true }
  const newRows = [...requestBodyFormData.value, newRow]
  httpPutStore.setBodyFormData(newRows)
}
const removeFormDataRow = (index: number) => {
  const newRows = [...requestBodyFormData.value]
  newRows.splice(index, 1)
  httpPutStore.setBodyFormData(newRows)
}
const handleFileChange = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const newRows = [...requestBodyFormData.value]
    newRows[index].value = target.files[0]
    httpPutStore.setBodyFormData(newRows)
  }
}
const onTypeChange = (index: number) => {
  const newRows = [...requestBodyFormData.value]
  newRows[index].value = ''
  httpPutStore.setBodyFormData(newRows)
}
const clearFile = (index: number) => {
  const newRows = [...requestBodyFormData.value]
  newRows[index].value = ''
  httpPutStore.setBodyFormData(newRows)
}

// --- 动画 Tab 逻辑 ---
const requestTabs = ['Query Params', 'Headers', 'Body']
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

// --- 上传和响应状态 ---
const uploadState = reactive({ isUploading: false, isSuccess: false, progress: 0 })
const loading = ref(false)
const hasBeenSent = ref(false)
const response = ref<any>(null)
const resetUploadState = () => {
  uploadState.isUploading = false
  uploadState.isSuccess = false
  uploadState.progress = 0
}

// --- onMounted ---
onMounted(() => {
  setTimeout(() => {
    updateRequestUnderline()
    if (response.value) {
      updateResponseUnderline()
    }
  }, 100)
})

// --- Computed Properties for Response ---
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
  resetUploadState()
  if (httpPutStore.request.bodyType === 'form-data') {
    uploadState.isUploading = true
  }
  const startTime = Date.now()
  try {
    const finalUrl = new URL(httpPutStore.request.url)
    httpPutStore.request.params.forEach((param) => {
      if (param.enabled && param.key) {
        finalUrl.searchParams.append(param.key, param.value as string)
      }
    })
    const headers: Record<string, string> = {}
    httpPutStore.request.headers.forEach((header) => {
      if (header.enabled && header.key) {
        headers[header.key] = header.value
      }
    })
    let bodyData: any = null
    let isFormDataRequest = false
    if (httpPutStore.request.bodyType === 'form-data') {
      isFormDataRequest = true
      delete headers['Content-Type']
      delete headers['content-type']
      const formData = new FormData()
      httpPutStore.request.bodyFormData.forEach((item) => {
        if (item.enabled && item.key) {
          formData.append(item.key, item.value as string | Blob)
        }
      })
      bodyData = formData
    } else {
      uploadState.isUploading = false
      try {
        bodyData = JSON.parse(httpPutStore.request.bodyRaw)
      } catch (e) {
        bodyData = httpPutStore.request.bodyRaw
        console.warn('Request body is not a valid JSON, sending as plain text.')
      }
    }
    const axiosConfig = {
      headers,
      onUploadProgress: (progressEvent: any) => {
        if (isFormDataRequest && progressEvent.total) {
          uploadState.isUploading = true
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          uploadState.progress = percentCompleted
        }
      },
    }
    const res = await axios.put(finalUrl.toString(), bodyData, axiosConfig) // 使用 axios.put
    if (uploadState.isUploading) {
      uploadState.isSuccess = true
      setTimeout(() => {
        uploadState.isSuccess = false
      }, 3000)
    }
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
    uploadState.isUploading = false
    nextTick(updateResponseUnderline)
  }
}
</script>

<style scoped>
/* 样式与 HttpPostView.vue 完全一样，只修改 method-tag 的颜色 */
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
.method-tag.put {
  background-color: #61affe;
} /* PUT 的颜色 */
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
.body-type-selector {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 20px;
}
.body-type-selector label {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}
.body-editor-area {
  margin-top: 10px;
}
.body-editor {
  width: 100%;
  height: 25vh;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
}
.body-editor:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
.form-data-editor .kv-row {
  display: flex;
  align-items: flex-end;
  margin-bottom: 8px;
  gap: 10px;
}
.form-data-editor .kv-checkbox {
  margin-bottom: 8px;
  flex-shrink: 0;
}
.form-data-editor .kv-input-wrapper {
  flex: 1;
  min-width: 150px;
}
.form-data-editor .kv-select {
  flex-shrink: 0;
  box-sizing: border-box;
  border: none;
  border-bottom: 1px solid #a0a0a0;
  background: transparent;
  height: 43px;
  padding: 0 5px;
  font-size: 16px;
  font-family: inherit;
  border-radius: 0;
  cursor: pointer;
}
.form-data-editor .kv-select:focus {
  outline: none;
  border-color: #5264ae;
}
.file-input-container {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #a0a0a0;
  height: 43px;
  box-sizing: border-box;
  padding: 0 5px;
  width: 100%;
}
.file-input-label {
  display: inline-block;
  padding: 4px 12px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}
.file-input-label:hover {
  background-color: #e0e0e0;
}
.file-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.file-name {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.clear-file-btn {
  border: none;
  background: none;
  color: #999;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  padding: 0 5px;
  line-height: 1;
  flex-shrink: 0;
}
.clear-file-btn:hover {
  color: #333;
}
.form-data-editor .kv-button {
  border: none;
  color: white;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-weight: bold;
  flex-shrink: 0;
  margin-bottom: 8px;
}
.form-data-editor .remove-btn {
  background-color: #f93e3e;
}
.form-data-editor .add-btn {
  margin-top: 10px;
  width: auto;
  padding: 6px 12px;
  background-color: #0275d8;
}
.upload-status-container {
  margin-top: 20px;
}
.upload-progress-card,
.upload-success-card {
  background-color: #fff;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.progress-text {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}
.progress-percent {
  font-size: 14px;
  color: #606266;
}
.progress-bar-track {
  width: 100%;
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background-color: #007bff;
  border-radius: 3px;
  transition: width 0.25s ease;
}
.upload-success-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f0f9eb;
  border-color: #e1f3d8;
}
.success-text {
  font-size: 15px;
  color: #67c23a;
  font-weight: 500;
}
.success-checkmark {
  font-size: 18px;
  color: #67c23a;
}
.response-area h3 {
  margin-bottom: 15px;
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
