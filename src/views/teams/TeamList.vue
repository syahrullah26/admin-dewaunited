<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getTeams, createTeam, updateTeam } from '@/api/team.api'
import type { Team } from '@/api/team.api'

defineOptions({ name: 'TeamListView' })

/* ================= STATE ================= */
const teams = ref<Team[]>([])
const loading = ref(false)
const submitting = ref(false)
const showCreateForm = ref(true)

/* ================= PAGINATION ================= */
const page = ref(1)
const lastPage = ref(1)

/* ================= FORM ================= */
const name = ref('')
const stadium = ref('')
const logo = ref<File | null>(null)
const logoPreview = ref<string | null>(null)
const removeLogo = ref(false)

/* ================= EDIT MODE ================= */
const editingTeamId = ref<number | null>(null)
const isEditing = computed(() => editingTeamId.value !== null)

/* ================= TOAST ================= */
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)
const showToast = (message: string, type: 'success' | 'error') => {
  toast.value = { message, type }
  setTimeout(() => (toast.value = null), 3000)
}

/* ================= METHODS ================= */
const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement

  const files = target.files
  if (!files || files.length === 0) return

  const file = files.item(0)
  if (!file) return

  logo.value = file
  logoPreview.value = URL.createObjectURL(file)
  removeLogo.value = false
}

const loadTeams = async () => {
  loading.value = true
  try {
    const res = await getTeams(page.value)
    teams.value = res.data
    lastPage.value = res.last_page
  } catch {
    showToast('Gagal mengambil data tim', 'error')
  } finally {
    loading.value = false
  }
}

/* ================= CREATE / UPDATE ================= */
const submitTeam = async () => {
  if (!name.value || !stadium.value) {
    showToast('Nama tim dan stadium wajib diisi', 'error')
    return
  }

  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('name', name.value)
    formData.append('stadium', stadium.value)

    if (logo.value) formData.append('logo', logo.value)
    if (removeLogo.value) formData.append('remove_logo', '1')

    if (isEditing.value && editingTeamId.value) {
      formData.append('_method', 'PUT')
      await updateTeam(editingTeamId.value, formData)
      showToast('Tim berhasil diperbarui', 'success')
    } else {
      await createTeam(formData)
      showToast('Tim berhasil dibuat', 'success')
    }

    resetForm()
    loadTeams()
  } catch {
    showToast('Gagal menyimpan tim', 'error')
  } finally {
    submitting.value = false
  }
}

/* ================= EDIT HANDLER ================= */
const editTeam = (team: Team) => {
  editingTeamId.value = team.id
  name.value = team.name
  stadium.value = team.stadium ?? ''
  logoPreview.value = team.logo_url ?? null
  logo.value = null
  removeLogo.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => resetForm()
const resetForm = () => {
  name.value = ''
  stadium.value = ''
  logo.value = null
  logoPreview.value = null
  removeLogo.value = false
  editingTeamId.value = null
}

onMounted(loadTeams)
</script>

<template>
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

    <!-- ================= CREATE TEAM ================= -->
    <div class="bg-zinc-900 rounded-sm p-4 space-y-4">

      <!-- HEADER -->
      <div class="relative flex items-center justify-between">
        <!-- LEFT -->
        <RouterLink
          to="/"
          class="flex items-center gap-2 text-sm px-3 py-2 rounded-md
                bg-linear-to-r from-[#aa8320] to-[#7b5902]
                hover:from-[#cfa73a] hover:to-[#7b5902]
                text-white transition"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </RouterLink>

        <!-- CENTER -->
        <h1 class="absolute left-1/2 -translate-x-1/2 text-white text-xl font-semibold">
          {{ isEditing ? 'Edit Team' : 'Create Team' }}
        </h1>

        <!-- RIGHT -->
        <button
          @click="showCreateForm = !showCreateForm"
          class="text-sm px-3 py-2 rounded-md border border-zinc-700
                text-gray-300 hover:bg-zinc-800 transition"
        >
          {{ showCreateForm ? 'Hide' : 'Show' }}
        </button>
      </div>

      <hr class="border-[#aa8320]" />

      <!-- FORM -->
      <transition
        enter-active-class="transition-all duration-300"
        leave-active-class="transition-all duration-300"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-[1000px]"
        leave-from-class="opacity-100 max-h-[1000px]"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-if="showCreateForm" class="space-y-6 overflow-hidden">

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label">Nama Team</label>
              <input v-model="name" class="form-input" placeholder="Nama Team" />
            </div>

            <div>
              <label class="form-label">Stadium</label>
              <input v-model="stadium" class="form-input" placeholder="Nama Stadium" />
            </div>
          </div>

          <div>
            <label class="form-label">Team Logo</label>
            <label class="form-image">
              <input type="file" accept="image/*" class="hidden" @change="onFileChange" />
              <span>Upload Image</span>
            </label>
          </div>

          <div class="bg-zinc-800 rounded-md p-4">
            <p class="text-white font-semibold mb-2">Preview Logo</p>
            <img
              v-if="logoPreview"
              :src="logoPreview"
              class="w-24 h-24 rounded-md object-cover"
            />
            <p v-else class="text-gray-400 text-sm">Belum ada logo</p>

          </div>

          <div class="flex gap-2">
            <button
              @click="submitTeam"
              :disabled="submitting"
              class="bg-linear-to-r from-[#aa8320] to-[#7b5902]
                     hover:from-[#cfa73a] hover:to-[#7b5902]
                     text-white py-3 px-5 rounded-lg font-semibold transition"
            >
              {{ submitting ? 'Saving...' : isEditing ? 'Update' : 'Submit' }}
            </button>

            <button
              v-if="isEditing"
              @click="cancelEdit"
              class="border border-zinc-600 text-gray-300 px-5 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </transition>
    </div>

    <!-- ================= TEAM LIST ================= -->
    <div class="bg-zinc-900 rounded-sm p-4">
      <h2 class="text-white text-lg font-semibold mb-4">List Teams</h2>

      <p v-if="loading" class="text-gray-400">Loading...</p>

      <ul v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <li
          v-for="team in teams"
          :key="team.id"
          class="bg-zinc-800 rounded-md p-4 flex flex-col gap-2"
        >
          <div class="flex items-center gap-4">
            <img
              :src="team.logo_url || '/images/team-placeholder.png'"
              class="w-12 h-12 rounded-md object-cover"
            />
            <div>
              <p class="text-white font-medium">{{ team.name }}</p>
              <p class="text-gray-400 text-sm">{{ team.stadium }}</p>
            </div>
          </div>

          <div class="flex gap-2 mt-2">
            <button
              @click="editTeam(team)"
              class="text-xs px-3 py-1 rounded bg-zinc-700 text-gray-200 hover:bg-zinc-600"
            >
              Edit
            </button>
          </div>
        </li>
      </ul>

      <!-- PAGINATION -->
      <div class="flex justify-center gap-2 mt-4">
        <button
          v-for="p in lastPage"
          :key="p"
          @click="page = p; loadTeams()"
          class="px-3 py-1 rounded transition"
          :class="p === page ? 'bg-[#aa8320] text-white' : 'bg-zinc-700 text-gray-300'"
        >
          {{ p }}
        </button>
      </div>
    </div>

    <!-- ================= TOAST ================= -->
    <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="toast"
        class="fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white"
        :class="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'"
      >
        {{ toast.message }}
      </div>
    </transition>

  </main>
</template>
