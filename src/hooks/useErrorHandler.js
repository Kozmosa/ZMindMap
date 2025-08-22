/**
 * Error handling composable
 * Provides consistent error handling across the application
 */
import { ElMessage } from 'element-plus'

export function useErrorHandler() {
  /**
   * Handle API errors with user-friendly messages
   * @param {Error} error - The error object
   * @param {string} defaultMessage - Default message if error has no specific message
   */
  const handleApiError = (error, defaultMessage = '操作失败，请稍后重试') => {
    console.error('API Error:', error)
    
    // Send to Sentry if available
    if (window.Sentry) {
      window.Sentry.captureException(error)
    }
    
    // Extract meaningful error message
    let message = defaultMessage
    if (error.response?.data?.message) {
      message = error.response.data.message
    } else if (error.message) {
      message = error.message
    }
    
    ElMessage.error(message)
  }

  /**
   * Handle validation errors
   * @param {string} message - Validation error message
   */
  const handleValidationError = (message) => {
    ElMessage.warning(message)
  }

  /**
   * Handle network errors
   * @param {Error} error - Network error
   */
  const handleNetworkError = (error) => {
    console.error('Network Error:', error)
    
    if (window.Sentry) {
      window.Sentry.captureException(error)
    }
    
    ElMessage.error('网络连接失败，请检查网络设置')
  }

  /**
   * Wrapper for async operations with error handling
   * @param {Function} asyncFn - Async function to execute
   * @param {string} errorMessage - Custom error message
   */
  const withErrorHandling = async (asyncFn, errorMessage) => {
    try {
      return await asyncFn()
    } catch (error) {
      handleApiError(error, errorMessage)
      throw error // Re-throw so caller can handle if needed
    }
  }

  return {
    handleApiError,
    handleValidationError,
    handleNetworkError,
    withErrorHandling
  }
}

export default useErrorHandler