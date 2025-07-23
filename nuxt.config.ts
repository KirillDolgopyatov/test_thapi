export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  
  app: {
    head: {
      script: [
        {
          src: 'https://telegram.org/js/telegram-web-app.js',
          defer: true
        }
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' }
      ]
    }
  },
  
  css: ['~/assets/css/main.css'],
  
  typescript: {
    strict: true
  },
  
  devtools: { enabled: true }
})
