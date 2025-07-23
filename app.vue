<template>
  <div class="app-container">
    <div v-if="userStore.user" class="user-header">
      <div class="user-name">{{ userStore.displayName }}</div>
      <button 
        class="copy-button" 
        @click="copyUserName"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
        title="Копировать имя"
      >
        <svg class="copy-icon" viewBox="0 0 24 24">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
      </button>
    </div>

    <div class="avatar-section">
      <div v-if="userStore.hasPhoto" class="avatar-container">
        <img 
          :src="userStore.user?.photo_url" 
          :alt="userStore.fullName"
          class="avatar"
        />
      </div>
      <div v-else class="avatar-placeholder">
        {{ userStore.user?.first_name?.charAt(0) || 'U' }}
      </div>
    </div>

    <form class="name-form" @submit.prevent="updateName">
      <h3 class="form-title">Изменить имя</h3>
      
      <div class="input-group">
        <label class="input-label">Новое имя</label>
        <input
          ref="nameInput"
          v-model="newName"
          type="text"
          class="name-input"
          placeholder="Введите новое имя"
          :disabled="userStore.isNameUpdating"
          @focus="handleInputFocus"
          @blur="handleInputBlur"
          required
        />
      </div>

      <button 
        type="submit" 
        class="update-button"
        :disabled="userStore.isNameUpdating || !newName.trim()"
      >
        <span v-if="userStore.isNameUpdating" class="loading-spinner"></span>
        {{ userStore.isNameUpdating ? 'Обновление...' : 'Обновить имя' }}
      </button>

      <div v-if="userStore.error" class="error-message">
        {{ userStore.error }}
      </div>
    </form>

    <div v-if="!telegram.isReady && !telegram.error" class="loading-message">
      Инициализация приложения...
    </div>

    <div v-if="telegram.error" class="error-message">
      {{ telegram.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '~/stores/user'
import { useTelegram } from '~/composables/useTelegram'

const userStore = useUserStore()
const telegram = useTelegram()
const newName = ref('')
const nameInput = ref<HTMLInputElement>()
const touchTimer = ref<NodeJS.Timeout | null>(null)

const copyUserName = async () => {
  if (userStore.user?.first_name) {
    try {
      await telegram.copyToClipboard(userStore.user.first_name)
    } catch (error) {
      console.error('Ошибка копирования:', error)
      telegram.showError('Не удалось скопировать имя')
    }
  }
}

const handleTouchStart = () => {
  touchTimer.value = setTimeout(() => {
    copyUserName()
  }, 500)
}

const handleTouchEnd = () => {
  if (touchTimer.value) {
    clearTimeout(touchTimer.value)
    touchTimer.value = null
  }
}

const handleInputFocus = () => {
  setTimeout(() => {
    if (nameInput.value) {
      nameInput.value.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
    }
  }, 300)
}

const handleInputBlur = () => {
  // Сброс ошибки при потере фокуса
  if (userStore.error) {
    userStore.setError(null)
  }
}

const updateName = async () => {
  if (!newName.value.trim()) {
    userStore.setError('Имя не может быть пустым')
    return
  }

  if (newName.value.trim().length < 2) {
    userStore.setError('Имя должно содержать минимум 2 символа')
    return
  }

  const success = await userStore.updateUserName(newName.value.trim())
  
  if (success) {
    telegram.showSuccess('Имя успешно обновлено!')
    newName.value = ''
  } else {
    telegram.showError(userStore.error || 'Ошибка при обновлении имени')
  }
}

onMounted(() => {
  watch(() => telegram.user.value, (newUser) => {
    if (newUser) {
      userStore.setUser(newUser)
    }
  }, { immediate: true })
})
</script>

<style scoped>
.loading-message {
  text-align: center;
  padding: 40px;
  color: var(--tg-theme-hint-color);
  font-size: 16px;
}

.avatar-container {
  position: relative;
}

.copy-button {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.name-input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
</style>
