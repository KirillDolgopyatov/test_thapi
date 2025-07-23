import { ref, onMounted, readonly } from 'vue'
import type { TelegramUser, TelegramWebApp } from '~/types/telegram'

export const useTelegram = () => {
  const webApp = ref<TelegramWebApp | null>(null)
  const user = ref<TelegramUser | null>(null)
  const isReady = ref(false)
  const error = ref<string | null>(null)

  const initTelegram = () => {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        webApp.value = window.Telegram.WebApp
        webApp.value?.ready()
        
        if (webApp.value?.initDataUnsafe?.user) {
          user.value = webApp.value.initDataUnsafe.user
        } else {
          error.value = 'Данные пользователя не найдены'
          return
        }
        
        isReady.value = true
        
        if (webApp.value?.themeParams?.bg_color) {
          document.documentElement.style.setProperty('--tg-theme-bg-color', webApp.value.themeParams.bg_color)
        }
        if (webApp.value?.themeParams?.text_color) {
          document.documentElement.style.setProperty('--tg-theme-text-color', webApp.value.themeParams.text_color)
        }
        if (webApp.value?.themeParams?.button_color) {
          document.documentElement.style.setProperty('--tg-theme-button-color', webApp.value.themeParams.button_color)
        }
        if (webApp.value?.themeParams?.button_text_color) {
          document.documentElement.style.setProperty('--tg-theme-button-text-color', webApp.value.themeParams.button_text_color)
        }
      } else {
        error.value = 'Telegram Web App не доступен'
      }
    } catch (err) {
      error.value = `Ошибка инициализации: ${err}`
    }
  }

  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (!text) {
      throw new Error('Текст для копирования не указан')
    }

    try {
      if ('clipboard' in navigator) {
        await (navigator as any).clipboard.writeText(text)
        webApp.value?.HapticFeedback.impactOccurred('light')
        webApp.value?.showAlert('Имя скопировано!')
        return true
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (successful) {
          webApp.value?.HapticFeedback.impactOccurred('light')
          webApp.value?.showAlert('Имя скопировано!')
          return true
        } else {
          throw new Error('Не удалось скопировать текст')
        }
      }
    } catch (err) {
      console.error('Ошибка копирования:', err)
      return false
    }
  }

  const showError = (message: string) => {
    if (!message) return
    
    webApp.value?.HapticFeedback.notificationOccurred('error')
    webApp.value?.showAlert(message)
  }

  const showSuccess = (message: string) => {
    if (!message) return
    
    webApp.value?.HapticFeedback.notificationOccurred('success')
    webApp.value?.showAlert(message)
  }

  const showWarning = (message: string) => {
    if (!message) return
    
    webApp.value?.HapticFeedback.notificationOccurred('warning')
    webApp.value?.showAlert(message)
  }

  const expandApp = () => {
    webApp.value?.expand()
  }

  const closeApp = () => {
    webApp.value?.close()
  }

  const isExpanded = () => {
    return webApp.value?.isExpanded || false
  }

  const getViewportHeight = () => {
    return webApp.value?.viewportHeight || 0
  }

  onMounted(() => {
    initTelegram()
  })

  return {
    webApp: readonly(webApp),
    user: readonly(user),
    isReady: readonly(isReady),
    error: readonly(error),
    copyToClipboard,
    showError,
    showSuccess,
    showWarning,
    expandApp,
    closeApp,
    isExpanded,
    getViewportHeight
  }
} 