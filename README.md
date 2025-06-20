# 🚀 轻量级 Web API 测试工具 (Lightweight Web API Tester)

一个现代化、基于浏览器的轻量级 API 测试客户端，旨在提供一个比 Postman 或 Apifox 更简洁、更直观、更易于后端开发者使用的界面。支持完整的 HTTP(S) 请求、Server-Sent Events (SSE) 和 WebSocket 通信。

**(请在这里替换为你的项目截图，一张动态的 GIF 图效果会更好！)**
![项目截图](placeholder.gif)

---

## ✨ 项目背景

这个项目诞生于一个有趣的需求：在我的前端兼职工作即将结束时，为了给后端同事提供一个比市面上现有工具更顺手的测试页面，我决定使用 Gemini 打造这款应用。它不仅是一个功能强大的工具，也凝聚了我在 Vue 3 生态中的实践与思考。

## 🌟 主要功能

这个工具涵盖了现代 Web 开发中最常见的三种后端通信方式：

### 📡 HTTP/HTTPS 客户端
- **完整的 RESTful 方法支持**: 实现了 `GET`, `POST`, `PUT`, `DELETE` 四种核心请求方法。
- **丰富的请求配置**:
    - **Query Params**: 动态添加、编辑、启用/禁用 URL 查询参数。
    - **Headers**: 自定义请求头，满足各种鉴权和内容类型需求。
    - **Request Body**:
        - 支持 `application/json` 格式，提供格式化输入。
        - 支持 `multipart/form-data`，可以方便地添加键值对并 **上传文件**。
- **强大的响应展示**: 清晰展示响应状态码、耗时、响应头和响应体。
- **文件上传进度**: 在上传大文件时，提供**实时进度条**和状态反馈，优化用户体验。
- **状态持久化**: 基于 Pinia 和 `pinia-plugin-persistedstate`，你所有的输入（URL、参数、请求体等）都会被**自动保存在本地**，刷新页面后数据不丢失。

###  STREAM Server-Sent Events (SSE)
- **实时事件流**: 连接到 SSE 端点，以流式的方式实时接收并展示服务器推送的事件。
- **关键字监听**: 不仅能接收默认的 `message` 事件，还支持**动态添加和移除对具名事件（关键字）的监听**。
- **清晰的日志输出**: 每条消息都带有时间戳和事件类型，一目了然。
- **智能连接管理**: 页面切换时，会自动断开连接，避免不必要的资源消耗。

### 🔌 WebSocket 客户端
- **全双工通信**: 建立 WebSocket 连接后，可以自由地向服务器**发送消息**，并实时接收服务器的推送。
- **聊天式日志**: 以对话气泡的形式清晰地区分“已发送”和“已接收”的消息。
- **连接状态管理**: 界面上清晰地展示“连接中”、“已连接”、“已断开”等状态。

---

## 🛠️ 技术栈

本项目采用现代前端技术栈构建，注重组件化、响应式和开发体验。

- **框架**: [Vue 3](https://vuejs.org/) (使用 Composition API 和 `<script setup>`)
- **构建工具**: [Vite](https://vitejs.dev/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **状态持久化**: [pinia-plugin-persistedstate](https://prazdevs.github.io/pinia-plugin-persisted-state/)
- **HTTP 客户端**: [Axios](https://axios-http.com/)
- **核心 API**: 原生 `EventSource` API 和 `WebSocket` API
- **UI**: 自定义组件库，展示了良好的组件封装和复用能力。
- **语言**: TypeScript

---

## 🚀 如何开始

1.  **克隆项目到本地**
    ```bash
    git clone [你的项目 Git 仓库地址]
    ```

2.  **进入项目目录**
    ```bash
    cd [你的项目文件夹名称]
    ```

3.  **安装依赖**
    ```bash
    npm install
    ```

4.  **启动开发服务器**
    ```bash
    npm run dev
    ```
    项目将在 `http://localhost:5173` (或其他端口) 启动。

---

## 💡 使用说明

- **HTTP**: 在左侧菜单选择 `GET`/`POST`/`PUT`/`DELETE`，然后在右侧面板填写请求地址、参数、请求头和请求体，点击“发送”即可。
- **SSE**: 进入 SSE 页面，输入 SSE 端点 URL（可使用默认的测试地址），点击“连接”。你可以添加自定义的事件名来监听特定消息。
- **WebSocket**: 进入 WebSocket 页面，输入 WebSocket URL（可使用默认的 `wss://echo.websocket.org` 进行测试），连接后即可在下方输入框发送和接收消息。

---
