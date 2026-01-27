<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getTeams } from '@/api/team.api'
import { getPlayersByTeam, createPlayer } from '@/api/player.api'
import type { Team } from '@/api/team.api'
import type { Player } from '@/api/player.api'
import { RouterLink } from 'vue-router'

/* ================= STATE ================= */
const teams = ref<Team[]>([])
const players = ref<Player[]>([])
const selectedTeamId = ref<number | null>(null)
const loadingTeams = ref(false)
const loadingPlayers = ref(false)
const submitting = ref(false)
const showCreateForm = ref(true)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

/* ================= FORM ================= */
const playerName = ref('')
const playerPosition = ref('')
const playerTeamId = ref<number | null>(null)

/* ================= TOAST ================= */
const showToast = (message: string, type: 'success' | 'error') => {
  toast.value = { message, type }
  setTimeout(() => (toast.value = null), 3000)
}

/* ================= METHODS ================= */
const loadTeams = async () => {
  loadingTeams.value = true
  try {
    const res = await getTeams()
    teams.value = res.data ?? res
  } catch {
    showToast('Gagal mengambil data tim', 'error')
  } finally {
    loadingTeams.value = false
  }
}

const loadPlayers = async (teamId: number) => {
  loadingPlayers.value = true
  selectedTeamId.value = teamId
  try {
    players.value = await getPlayersByTeam(teamId)
  } catch {
    showToast('Gagal mengambil pemain tim', 'error')
  } finally {
    loadingPlayers.value = false
  }
}

const submitPlayer = async () => {
  if (!playerName.value || !playerPosition.value || !playerTeamId.value) {
    showToast('Semua field wajib diisi', 'error')
    return
  }

  submitting.value = true
  try {
    await createPlayer({
      team_id: playerTeamId.value,
      nama_pemain: playerName.value,
      posisi: playerPosition.value
    })
    showToast('Pemain berhasil dibuat', 'success')
    playerName.value = ''
    playerPosition.value = ''
    playerTeamId.value = null
    if (selectedTeamId.value) loadPlayers(selectedTeamId.value)
  } catch {
    showToast('Gagal membuat pemain', 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(loadTeams)
</script>

<template>
  <main class="max-w-5xl mx-auto px-4 py-8 space-y-8">

    <!-- CREATE PLAYER FORM -->
    <div class="bg-zinc-900 rounded-sm p-4 space-y-4">

      <!-- HEADER -->
      <div class="relative flex items-center justify-between">
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

        <h1 class="absolute left-1/2 -translate-x-1/2 text-white text-xl font-semibold">
          Create Player
        </h1>

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
        <div v-if="showCreateForm" class="space-y-6 overflow-hidden mt-4">

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label">Nama Player</label>
              <input v-model="playerName" class="form-input" placeholder="Masukkan Nama Player" />
            </div>

            <div>
              <label class="form-label">Posisi</label>
              <input v-model="playerPosition" class="form-input" placeholder="Masukkan Posisi" />
            </div>

            <div class="md:col-span-2">
              <label class="form-label">Pilih Tim</label>
              <select v-model="playerTeamId" class="form-input w-full">
                <option value="" disabled>Pilih Tim</option>
                <option v-for="team in teams" :key="team.id" :value="team.id">
                  {{ team.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              @click="submitPlayer"
              :disabled="submitting"
              class="bg-linear-to-r from-[#aa8320] to-[#7b5902] hover:from-[#cfa73a] hover:to-[#7b5902] text-white py-3 px-5 rounded-lg font-semibold transition-all duration-300"
            >
              {{ submitting ? 'Saving...' : 'Submit' }}
            </button>
          </div>
        </div>
      </transition>
    </div>

    <!-- LIST TEAMS -->
    <div class="bg-zinc-900 rounded-md p-6 space-y-4">
      <h2 class="text-white font-semibold text-lg">Teams</h2>
      <ul class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <li
          v-for="team in teams"
          :key="team.id"
          @click="loadPlayers(team.id)"
          class="cursor-pointer bg-zinc-800 p-4 rounded-md hover:bg-zinc-700 transition text-white"
        >
          {{ team.name }}
        </li>
      </ul>
    </div>

    <!-- LIST PLAYERS -->
    <div v-if="selectedTeamId" class="bg-zinc-900 rounded-md p-6 space-y-4">
      <h2 class="text-white font-semibold text-lg">
        Players in Team: {{ teams.find(t => t.id === selectedTeamId)?.name }}
      </h2>
      <p v-if="loadingPlayers" class="text-gray-400">Loading...</p>
      <ul v-else class="space-y-2">
        <li v-for="player in players" :key="player.id" class="bg-zinc-800 p-3 rounded-md text-white">
          {{ player.nama_pemain }} - {{ player.posisi }}
        </li>
      </ul>
      <p v-if="!loadingPlayers && players.length === 0" class="text-gray-400">Belum ada pemain</p>
    </div>

    <!-- TOAST -->
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
