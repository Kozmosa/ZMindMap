import { createApp } from 'vue'
import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/tracing'
import configService from './services/configService'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/assets/css/reset.css'

// 一次性引入所有svg图
const req = require.context('./assets/pic', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)

// Initialize app
const app = createApp(App)

// Load configuration before starting the app
async function initializeApp() {
  try {
    // Load external configuration
    await configService.loadConfig()
    console.log('Configuration loaded successfully')
  } catch (error) {
    console.warn('Failed to load configuration:', error)
  }

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

  // Set initial theme
  const websiteCfg = JSON.parse(localStorage.getItem('zmindmap_website') || '{}')
  const isDark = websiteCfg?.isDark
  window.document.documentElement.setAttribute(
    'data-theme',
    isDark ? 'dark' : 'light'
  )

  // Initialize Sentry if configuration allows
  const sentryCfg = configService.get('sentryCfg', {})
  if (sentryCfg.tracingOrigins?.includes(window.location.hostname)) {
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

  // Mount the app
  app.use(store).use(router).mount('#app')
}

// Start the application
initializeApp().catch(error => {
  console.error('Failed to initialize application:', error)
  // Mount app anyway with fallback configuration
  app.use(store).use(router).mount('#app')
})
