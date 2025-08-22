/**
 * Loading state composable
 * Provides consistent loading state management across the application
 */
import { ref, computed } from 'vue'

export function useLoading(initialState = false) {
  const isLoading = ref(initialState)
  const loadingText = ref('加载中...')
  
  /**
   * Set loading state with optional text
   * @param {boolean} state - Loading state
   * @param {string} text - Loading text
   */
  const setLoading = (state, text = '加载中...') => {
    isLoading.value = state
    loadingText.value = text
  }

  /**
   * Start loading with optional text
   * @param {string} text - Loading text
   */
  const startLoading = (text = '加载中...') => {
    setLoading(true, text)
  }

  /**
   * Stop loading
   */
  const stopLoading = () => {
    setLoading(false)
  }

  /**
   * Execute async function with loading state
   * @param {Function} asyncFn - Async function to execute
   * @param {string} loadingText - Loading text to show
   */
  const withLoading = async (asyncFn, loadingText = '加载中...') => {
    startLoading(loadingText)
    try {
      const result = await asyncFn()
      return result
    } finally {
      stopLoading()
    }
  }

  return {
    isLoading: computed(() => isLoading.value),
    loadingText: computed(() => loadingText.value),
    setLoading,
    startLoading,
    stopLoading,
    withLoading
  }
}

export default useLoading