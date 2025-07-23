import { defineStore } from 'pinia'
import type { TelegramUser } from '~/types/telegram'

interface UserState {
  user: TelegramUser | null
  isLoading: boolean
  error: string | null
  isNameUpdating: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    isLoading: false,
    error: null,
    isNameUpdating: false
  }),

  getters: {
    fullName: (state) => {
      if (!state.user) return ''
      return state.user.last_name 
        ? `${state.user.first_name} ${state.user.last_name}`
        : state.user.first_name
    },
    
    displayName: (state) => {
      if (!state.user) return ''
      return state.user.username 
        ? `@${state.user.username}`
        : state.user.first_name
    },
    
    hasPhoto: (state) => {
      return !!state.user?.photo_url
    },

    userId: (state) => {
      return state.user?.id || null
    },

    isAuthenticated: (state) => {
      return !!state.user
    }
  },

  actions: {
    setUser(user: TelegramUser) {
      this.user = user
      this.error = null
      this.isLoading = false
    },

    setLoading(loading: boolean) {
      this.isLoading = loading
      if (loading) {
        this.error = null
      }
    },

    setError(error: string | null) {
      this.error = error
      this.isNameUpdating = false
    },

    clearError() {
      this.error = null
    },

    async updateUserName(newFirstName: string) {
      if (!this.user) {
        this.setError('Пользователь не найден')
        return false
      }

      if (!newFirstName.trim()) {
        this.setError('Имя не может быть пустым')
        return false
      }

      if (newFirstName.trim().length < 2) {
        this.setError('Имя должно содержать минимум 2 символа')
        return false
      }

      if (newFirstName.trim().length > 50) {
        this.setError('Имя не может быть длиннее 50 символов')
        return false
      }

      this.isNameUpdating = true
      this.setError(null)

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.user = {
          ...this.user,
          first_name: newFirstName.trim()
        }
        
        return true
      } catch (err) {
        this.setError('Ошибка при обновлении имени')
        return false
      } finally {
        this.isNameUpdating = false
      }
    },

    async refreshUser() {
      if (!this.user) return

      this.setLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        // В реальном приложении здесь был бы API запрос
        return true
      } catch (err) {
        this.setError('Ошибка при обновлении данных пользователя')
        return false
      } finally {
        this.setLoading(false)
      }
    },

    clearUser() {
      this.user = null
      this.error = null
      this.isLoading = false
      this.isNameUpdating = false
    }
  }
}) 