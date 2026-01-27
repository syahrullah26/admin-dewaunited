import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import { loginRequest, logoutRequest } from '@/api/authService'
import router from '@/router'
import axios from '@/api/axios'

function safeParse<T>(value: string | null): T | null {
  if (!value || value === 'undefined') return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: safeParse<any>(localStorage.getItem('user')),
    token: localStorage.getItem('token'),
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    async login(payload: { email: string; password: string }) {
      const res = await loginRequest(payload)

      if (res.user.role !== 'admin') {
        throw new Error('Akses ditolak. Hanya admin yang diperbolehkan.')
      }

      this.user = res.user
      this.token = res.token

      localStorage.setItem('user', JSON.stringify(res.user))
      localStorage.setItem('token', res.token)

      axios.defaults.headers.common.Authorization = `Bearer ${res.token}`

      await nextTick()
      router.replace({ name: 'dashboard' })
    },

    initAuth() {
      if (this.token) {
        axios.defaults.headers.common.Authorization = `Bearer ${this.token}`
      }
    },

    async logout() {
      try {
        await logoutRequest()
      } catch (e) {
        console.warn('Logout API failed, clearing local state')
      } finally {
        this.user = null
        this.token = null

        localStorage.removeItem('user')
        localStorage.removeItem('token')

        delete axios.defaults.headers.common.Authorization

        router.replace({ name: 'login' })
      }
    },
  },
})
