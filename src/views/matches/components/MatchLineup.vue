<script lang="ts" setup>
import { ref } from 'vue'
import axios from '@/api/axios'
import type { Player } from '@/api/player.api'

interface Lineup {
  player_id: number
  status: 'starter' | 'substitute'
}

const props = defineProps<{
  matchId: string
  homeTeamId?: number
  awayTeamId?: number
  homePlayers: Player[]
  awayPlayers: Player[]
  displayHomeLineup: any[]
  displayAwayLineup: any[]
}>()

const emit = defineEmits(['refresh'])

const showForm = ref(false)
const submitting = ref(false)

const homeLineup = ref<Lineup[]>([{ player_id: 0, status: 'starter' }])
const awayLineup = ref<Lineup[]>([{ player_id: 0, status: 'starter' }])

const addPlayer = (type: 'home' | 'away') => {
  const target = type === 'home' ? homeLineup : awayLineup
  target.value.push({ player_id: 0, status: 'starter' })
}

const removePlayer = (type: 'home' | 'away', index: number) => {
  const target = type === 'home' ? homeLineup : awayLineup
  if (target.value.length > 1) target.value.splice(index, 1)
}

const submitLineup = async () => {
  const validHome = homeLineup.value.filter(l => l.player_id > 0)
  const validAway = awayLineup.value.filter(l => l.player_id > 0)

  if (validHome.length === 0 && validAway.length === 0) {
    alert('Pilih minimal 1 pemain')
    return
  }

  submitting.value = true
  try {
    for (const l of validHome) {
      await axios.post('/lineup', {
        match_id: Number(props.matchId),
        team_id: props.homeTeamId,
        player_id: l.player_id,
        status: l.status,
      })
    }
    for (const l of validAway) {
      await axios.post('/lineup', {
        match_id: Number(props.matchId),
        team_id: props.awayTeamId,
        player_id: l.player_id,
        status: l.status,
      })
    }
    alert('Lineup berhasil disimpan!')
    emit('refresh')
    showForm.value = false
  } catch (e) {
    alert('Gagal menyimpan lineup')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <div class="text-center mb-4">
      <h3 class="text-lg font-bold text-white mb-4">LINEUP</h3>
      <button @click="showForm = !showForm"
        class="text-sm px-3 py-2 rounded-md border border-zinc-700 text-gray-300 hover:bg-zinc-700">
        {{ showForm ? 'Hide Form' : 'Show Form' }}
      </button>
    </div>

    <div v-if="showForm" class="space-y-6 mb-10">
      <div v-for="type in (['home', 'away'] as const)" :key="type">
        <div class="flex justify-between mb-3">
          <p class="font-semibold text-zinc-300">{{ type === 'home' ? 'Home Team' : 'Away Team' }}</p>
          <button @click="addPlayer(type)" class="px-3 py-1 text-xs rounded bg-green-600 hover:bg-green-700">
            + Add Player
          </button>
        </div>
        
        <div v-for="(l, i) in (type === 'home' ? homeLineup : awayLineup)" :key="i" class="grid md:grid-cols-3 gap-4 mb-3 items-end">
          <div>
            <label class="form-label text-xs">Player</label>
            <select v-model="l.player_id" class="form-input">
              <option :value="0" disabled>Select Player</option>
              <option v-for="p in (type === 'home' ? homePlayers : awayPlayers)" :key="p.id" :value="p.id">
                {{ p.nama_pemain }}
              </option>
            </select>
          </div>
          <div>
            <label class="form-label text-xs">Status</label>
            <select v-model="l.status" class="form-input">
              <option value="starter">Starter</option>
              <option value="substitute">Substitute</option>
            </select>
          </div>
          <button @click="removePlayer(type, i)" class="px-3 py-2 text-xs rounded bg-red-600 hover:bg-red-700 h-fit">
            Remove
          </button>
        </div>
      </div>

      <button @click="submitLineup" :disabled="submitting"
        class="w-full bg-linear-to-r from-[#aa8320] to-[#7b5902] text-white py-3 rounded font-semibold transition disabled:opacity-50">
        {{ submitting ? 'Saving Lineup...' : 'Save Lineup' }}
      </button>
    </div>

    <div v-if="displayHomeLineup.length > 0 || displayAwayLineup.length > 0" class="grid md:grid-cols-2 gap-6">
      <div v-for="side in (['home', 'away'] as const)" :key="side" class="bg-zinc-800 p-4 rounded">
        <h4 class="font-bold text-white mb-4">{{ side === 'home' ? 'Home Team' : 'Away Team' }}</h4>
        <div class="space-y-2">
          <div v-for="l in (side === 'home' ? displayHomeLineup : displayAwayLineup).filter(x => x.status === 'starter')" 
            :key="l.id" class="flex justify-between py-2 border-b border-zinc-700">
            <span>{{ l.player.nama_pemain }}</span>
            <span class="text-zinc-400 text-sm">{{ l.player.posisi }}</span>
          </div>
          <div class="mt-4">
            <p class="text-xs text-zinc-500 mb-2">Substitutes:</p>
            <div v-for="l in (side === 'home' ? displayHomeLineup : displayAwayLineup).filter(x => x.status === 'substitute')"
              :key="l.id" class="flex justify-between py-1 text-sm text-zinc-400">
              <span>{{ l.player.nama_pemain }}</span>
              <span>{{ l.player.posisi }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>