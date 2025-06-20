import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Layout from '../layout/AppLayout.vue'

// --- 导入需要的组件 ---
// 注意：在这个新结构中，HttpView 组件不再需要，可以删掉或不再引入
import RestfulTestView from '../views/http/RestfulTestView.vue'
import HttpGetView from '../views/http/HttpGetView.vue'
import HttpPostView from '../views/http/HttpPostView.vue' // 1. 导入新组件
import HttpPutView from '../views/http/HttpPutView.vue' // 1. 导入新组件
import HttpDeleteView from '../views/http/HttpDeleteView.vue' // 1. 导入新组件
import SseView from '../views/SseView.vue' // 1. 导入新组件
import WebsocketView from '../views/WebsocketView.vue' // 1. 导入新组件
// import HttpPostView from '../views/http/HttpPostView.vue' // 其他方法的组件

const routes: Array<RouteRecordRaw> = [
  // 带布局的页面
  {
    path: '/',
    component: Layout,
    redirect: '/http', // 1. 默认路径直接重定向到 /http
    children: [
      {
        path: '/http', // 2. /http 路径现在直接使用 RestfulTestView 作为其组件
        component: RestfulTestView,
        redirect: '/http/get', // 3. 当访问 /http 时，自动重定向到 GET 页面
        children: [
          // 4. 所有子页面直接挂在 /http 之下
          {
            path: 'get', // 最终路径: /http/get
            name: 'http-get',
            component: HttpGetView,
          },
          {
            path: 'post', // 最终路径: /http/post
            name: 'http-post',
            component: HttpPostView,
          },
          {
            path: 'put', // 最终路径: /http/put
            name: 'http-put',
            component: HttpPutView,
          },
          {
            path: 'delete', // 最终路径: /http/delete
            name: 'http-delete',
            component: HttpDeleteView,
          },
          // ... 其他方法的路由
        ],
      },
      {
        path: '/sse',
        name: 'sse',
        component: SseView,
      },
      {
        path: '/websocket',
        name: 'websocket',
        component: WebsocketView,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
