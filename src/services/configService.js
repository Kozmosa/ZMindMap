/**
 * Configuration service for loading website configuration from external JSON
 * Replaces hardcoded window.CFG with dynamic configuration loading
 */

class ConfigService {
  constructor() {
    this.config = null
    this.isLoaded = false
    this.loadPromise = null
  }

  /**
   * Load configuration from external JSON file
   */
  async loadConfig() {
    if (this.loadPromise) {
      return this.loadPromise
    }

    this.loadPromise = this._fetchConfig()
    return this.loadPromise
  }

  async _fetchConfig() {
    try {
      const response = await fetch('/config/website.json')
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`)
      }
      
      this.config = await response.json()
      this.isLoaded = true
      
      // Set up window.CFG for backward compatibility
      window.CFG = this.config
      
      return this.config
    } catch (error) {
      console.warn('Failed to load external config, using defaults:', error)
      
      // Fallback to default configuration
      this.config = this._getDefaultConfig()
      this.isLoaded = true
      window.CFG = this.config
      
      return this.config
    }
  }

  /**
   * Get configuration value by path
   * @param {string} path - Dot notation path (e.g., 'apiCfg.baseURL')
   * @param {any} defaultValue - Default value if path not found
   */
  get(path, defaultValue = null) {
    if (!this.isLoaded) {
      console.warn('Config not loaded yet, returning default value')
      return defaultValue
    }

    const keys = path.split('.')
    let value = this.config

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return defaultValue
      }
    }

    return value
  }

  /**
   * Get all configuration
   */
  getAll() {
    return this.config
  }

  /**
   * Check if config is loaded
   */
  isConfigLoaded() {
    return this.isLoaded
  }

  /**
   * Default configuration as fallback
   */
  _getDefaultConfig() {
    return {
      apiCfg: {
        baseURL: '/api',
        timeout: 10000,
        withCredentials: true
      },
      sentryCfg: {
        dsn: '',
        tracingOrigins: ['localhost', '127.0.0.1'],
        tracesSampleRate: 0.1
      },
      socketCfg: {
        url: 'ws://localhost:3000',
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      },
      websiteCfg: {
        title: 'ZMindMap - 思维导图',
        description: '一个基于Vue3的在线思维导图工具',
        logo: '/favicon.ico',
        colors: {
          primary: '#409EFF',
          success: '#67C23A',
          warning: '#E6A23C',
          danger: '#F56C6C',
          info: '#909399'
        },
        features: {
          quickAccess: true,
          darkMode: true,
          export: {
            png: true,
            svg: true,
            json: true,
            highRes: true
          },
          collaboration: false,
          comments: false
        }
      },
      xssFilter: {
        stripIgnoreTagBody: true,
        whiteList: {
          h1: ['style'],
          h2: ['style'],
          h3: ['style'],
          h4: ['style'],
          h5: ['style'],
          h6: ['style'],
          p: ['style'],
          div: ['style'],
          span: ['style'],
          strong: ['style'],
          em: ['style'],
          u: ['style'],
          br: [],
          ol: ['style'],
          ul: ['style'],
          li: ['style'],
          a: ['href', 'title', 'target', 'style'],
          img: ['src', 'alt', 'title', 'width', 'height', 'style'],
          table: ['style'],
          thead: ['style'],
          tbody: ['style'],
          tr: ['style'],
          th: ['style'],
          td: ['style'],
          blockquote: ['style'],
          code: ['style'],
          pre: ['style']
        }
      }
    }
  }
}

// Create singleton instance
const configService = new ConfigService()

export default configService

// Export as composable for Vue 3
export function useConfig() {
  return {
    loadConfig: () => configService.loadConfig(),
    getConfig: (path, defaultValue) => configService.get(path, defaultValue),
    getAllConfig: () => configService.getAll(),
    isConfigLoaded: () => configService.isConfigLoaded()
  }
}