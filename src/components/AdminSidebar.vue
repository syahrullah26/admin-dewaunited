<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()

/* ================= STATE ================= */
const isOpen = ref(false) // mobile
const isCollapsed = ref(false) // desktop

// ================== LOGOUT =================
const auth = useAuthStore()
const router = useRouter()
const logoutHandle = async () => {
  await auth.logout()
  router.push('/login')
}

/* ================= MENU ================= */
const menus = [
  { name: 'Dashboard', to: '/', icon: '🏠' },
  { name: 'Manage Media', to: '/media', icon: '📸' },
  { name: 'Manage Teams', to: '/teams', icon: '👥' },
  { name: 'Manage Matches', to: '/matches', icon: '⚽' },
  { name: 'Manage Player', to: '/players', icon: '👤' },
  { name: 'Manage Activations', to: '/activations', icon: '✅' },
    { name: 'Manage Articles', to: '/articles', icon: '📝' },
  {
    name: 'Store Management',
    icon: '📦',
    children: [
      { name: 'Manage Category', to: '/category' },
      { name: 'Manage Product', to: '/products' },
      { name: 'Manage Look Book', to: '/lookbooks' },
    ],
  },
]

const openMenu = ref<string | null>(null)

const toggleMenu = (name: string) => {
  openMenu.value = openMenu.value === name ? null : name
}

const isActive = (path: string) =>
  computed(() => route.path === path || route.path.startsWith(path + '/'))
</script>

<template>
  <div v-if="isOpen" @click="isOpen = false" class="fixed inset-0 bg-black/60 z-30 lg:hidden" />

  <aside
    class="fixed top-0 left-0 h-screen z-40 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-300"
    :class="[
      isCollapsed ? 'w-20' : 'w-64',
      isOpen ? 'translate-x-0' : '-translate-x-full',
      'lg:translate-x-0',
    ]"
  >
    <div class="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
      <h1 v-if="!isCollapsed" class="text-lg font-bold text-white">
        <span class="text-gold">Admin</span> Panel
      </h1>

      <button
        @click="isCollapsed = !isCollapsed"
        class="hidden lg:flex text-gray-400 hover:text-white"
      >
        ☰
      </button>

      <button @click="isOpen = false" class="lg:hidden text-gray-400 hover:text-white">✕</button>
    </div>
    <nav class="flex-1 px-3 py-4 space-y-1">
      <template v-for="menu in menus" :key="menu.name">
        <RouterLink
          v-if="!menu.children"
          :to="menu.to"
          @click="isOpen = false"
          class="group flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 transition-all duration-200"
          :class="
            isActive(menu.to).value ? 'bg-gold text-white shadow-inner' : 'hover:bg-gold-hover'
          "
        >
          <span class="text-lg transition-transform duration-200 group-hover:scale-110">
            {{ menu.icon }}
          </span>

          <span v-if="!isCollapsed" class="font-medium group-hover:text-white transition-colors">
            {{ menu.name }}
          </span>
        </RouterLink>
        <div v-else class="space-y-1">
          <button
            @click="toggleMenu(menu.name)"
            class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-zinc-800/40 transition-all"
          >
            <div class="flex items-center gap-3">
              <span
                class="text-lg transition-transform duration-200"
                :class="openMenu === menu.name ? 'rotate-6 scale-110' : ''"
              >
                {{ menu.icon }}
              </span>

              <span v-if="!isCollapsed" class="font-medium">
                {{ menu.name }}
              </span>
            </div>
            <span
              v-if="!isCollapsed"
              class="text-xs transition-transform duration-300"
              :class="openMenu === menu.name ? 'rotate-180' : ''"
            >
              ▼
            </span>
          </button>
          <div
            v-if="openMenu === menu.name && !isCollapsed"
            class="ml-10 mt-2 space-y-1 border-l border-zinc-700/50 pl-3"
          >
            <RouterLink
              v-for="child in menu.children"
              :key="child.name"
              :to="child.to"
              class="block px-3 py-2 rounded-lg text-gray-400 text-sm hover:bg-zinc-800/50 hover:text-white transition-all"
              :class="isActive(child.to).value ? 'bg-gold text-white shadow-inner' : ''"
            >
              {{ child.name }}
            </RouterLink>
          </div>
        </div>
      </template>
    </nav>

    <div v-if="!isCollapsed" class="p-4 border-t border-zinc-800 text-sm text-gray-400">
      <div class="flex justify-center">
        <div class="mt-2 space-y-1 mb-2 w-full">
          <button
            @click="logoutHandle"
            class="w-full flex items-center cursor-pointer justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 bg-zinc-700/50 border border-red-500/30 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 active:scale-[0.98]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
      DUB-AP 2026
    </div>
  </aside>

  <header
    class="lg:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 z-20"
  >
    <button @click="isOpen = true" class="flex justify-center text-gray-300 text-xl">☰</button>

    <h1 class="ml-4 font-semibold text-white">Admin Panel</h1>
  </header>
</template>
