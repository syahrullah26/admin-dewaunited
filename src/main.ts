import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUsers, faUser, faFutbol } from '@fortawesome/free-solid-svg-icons'

import AOS from 'aos'
import 'aos/dist/aos.css'

library.add(
  faUsers,
  faUser,
  faFutbol
)

const app = createApp(App)

app
  .use(createPinia())
  .use(router)
  .component('font-awesome-icon', FontAwesomeIcon)
  .mount('#app')

AOS.init({
  duration: 1000,
  once: true,
  easing: 'ease-in-out',
})
