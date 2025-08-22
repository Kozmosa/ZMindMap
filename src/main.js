import { createApp } from 'vue'
import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/tracing'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/assets/css/reset.css'

// 一次性引入所有svg图
const req = require.context('./assets/pic', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)

const app = createApp(App)

// Global error handler for unhandled exceptions
app.config.errorHandler = (err, instance, info) => {
  console.error('[全局异常]', err, instance, info)
  
  // Send to Sentry if available
  if (window.Sentry) {
    window.Sentry.captureException(err, {
      contexts: {
        vue: {
          componentName: instance?.$options.name || 'Unknown',
          lifecycle: info
        }
      }
    })
  }
  
  // Show user-friendly error message
  const { ElMessage } = require('element-plus')
  ElMessage.error('应用遇到了意外错误，请刷新页面重试')
}

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
  console.error('[未处理的Promise拒绝]', event.reason)
  
  // Send to Sentry if available
  if (window.Sentry) {
    window.Sentry.captureException(event.reason)
  }
  
  // Show user-friendly error message
  const { ElMessage } = require('element-plus')
  ElMessage.error('网络请求失败，请检查网络连接')
  
  // Prevent default browser error handling
  event.preventDefault()
})

const websiteCfg = JSON.parse(localStorage.getItem('zmindmap_website') || '{}')
const isDark = websiteCfg?.isDark
window.document.documentElement.setAttribute(
  'data-theme',
  isDark ? 'dark' : 'light'
)
const { sentryCfg } = window.CFG
if (sentryCfg.tracingOrigins.includes(window.location.hostname)) {
  Sentry.init({
    app,
    dsn: sentryCfg.dsn,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracingOrigins: sentryCfg.tracingOrigins
      })
    ],
    tracesSampleRate: sentryCfg.tracesSampleRate
  })
}

app.use(store).use(router).mount('#app')
