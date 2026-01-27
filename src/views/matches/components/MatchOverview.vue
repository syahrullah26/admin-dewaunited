<script lang="ts" setup>
import { ref } from 'vue'
import { createMatchOverview, type GoalPayload } from '@/api/overview.api'
import type { Player } from '@/api/player.api'

const props = defineProps<{
  matchId: string
  homePlayers: Player[]
  awayPlayers: Player[]
  displayOverview: any
}>()

const emit = defineEmits(['refresh'])
const showForm = ref(false)
const submitting = ref(false)


const homeGoals = ref<GoalPayload[]>([{ playerId: 0, time: null }])
const awayGoals = ref<GoalPayload[]>([{ playerId: 0, time: null }])

const addGoal = (type: 'home' | 'away') => {
  const target = type === 'home' ? homeGoals : awayGoals
  target.value.push({ playerId: 0, time: null })
}

const removeGoal = (type: 'home' | 'away', index: number) => {
  const target = type === 'home' ? homeGoals : awayGoals
  if (target.value.length > 1) target.value.splice(index, 1)
}

const handleTimeLimit = (goal: GoalPayload) => {
  if (goal.time !== null) {
    if (goal.time > 120) {
      goal.time = 120
    }
    if (goal.time < 0) {
      goal.time = 1
    }
  }
}

const submitOverview = async () => {
  const validHome = homeGoals.value.filter(g => g.playerId > 0 && g.time !== null)
  const validAway = awayGoals.value.filter(g => g.playerId > 0 && g.time !== null)
  const isTimeInvalid = [...homeGoals.value, ...awayGoals.value].some(g => g.time && g.time > 120)
  
  if (isTimeInvalid) {
    alert('Waktu gol tidak boleh lebih dari 120 menit!')
    return
  }
  
  submitting.value = true
  try {
    await createMatchOverview(Number(props.matchId), { 
      homeGoals: validHome, 
      awayGoals: validAway 
    })
    alert('Overview berhasil disimpan!')
    emit('refresh')
    showForm.value = false
  } catch (e) {
    alert('Gagal menyimpan overview')
  } finally {
    submitting.value = false
  }
}

const getPlayerName = (playerId: number, players: Player[]) => {
  const player = players.find(p => p.id === playerId)
  return player ? `${player.nama_pemain} (${player.posisi})` : 'Unknown'
}
</script>

<template>
  <div>
    <div class="text-center mb-4">
      <h3 class="text-lg font-bold text-white mb-4">OVERVIEW (Goals)</h3>
      <button @click="showForm = !showForm"
        class="text-sm px-3 py-2 rounded-md border border-zinc-700 text-gray-300 hover:bg-zinc-700">
        {{ showForm ? 'Hide Form' : 'Show Form' }}
      </button>
    </div>

    <div v-if="showForm" class="space-y-6 mb-8">
      <div>
        <div class="flex justify-between mb-3">
          <p class="font-semibold text-zinc-300">Home Team Goals</p>
          <button @click="addGoal('home')" class="px-3 py-1 text-xs rounded bg-green-600 hover:bg-green-700">
            + Add Goal
          </button>
        </div>
        <div v-for="(goal, i) in homeGoals" :key="'home-'+i" class="grid md:grid-cols-3 gap-4 mb-3 items-end">
          <div>
            <label class="form-label text-xs">Player</label>
            <select v-model="goal.playerId" class="form-input">
              <option :value="0" disabled>Select Player</option>
              <option v-for="p in homePlayers" :key="p.id" :value="p.id">{{ p.nama_pemain }}</option>
            </select>
          </div>
          <div>
            <label class="form-label text-xs">Time (min)</label>
            <input 
            v-model.number="goal.time"
            type="number" 
            min="1"
            max="120"
            class="form-input" 
            placeholder="45" />
          </div>
          <button v-if="homeGoals.length > 1" @click="removeGoal('home', i)"
            class="px-3 py-2 text-xs rounded bg-red-600 hover:bg-red-700 h-fit">Remove</button>
        </div>
      </div>

      <hr class="border-zinc-700" />

      <div>
        <div class="flex justify-between mb-3">
          <p class="font-semibold text-zinc-300">Away Team Goals</p>
          <button @click="addGoal('away')" class="px-3 py-1 text-xs rounded bg-green-600 hover:bg-green-700">
            + Add Goal
          </button>
        </div>
        <div v-for="(goal, i) in awayGoals" :key="'away-'+i" class="grid md:grid-cols-3 gap-4 mb-3 items-end">
          <div>
            <label class="form-label text-xs">Player</label>
            <select v-model="goal.playerId" class="form-input">
              <option :value="0" disabled>Select Player</option>
              <option v-for="p in awayPlayers" :key="p.id" :value="p.id">{{ p.nama_pemain }}</option>
            </select>
          </div>
          <div>
            <label class="form-label text-xs">Time (min)</label>
            <input 
            v-model.number="goal.time" 
            type="number" 
            min="1"
            max="120"
            class="form-input" 
            placeholder="83" />
          </div>
          <button v-if="awayGoals.length > 1" @click="removeGoal('away', i)"
            class="px-3 py-2 text-xs rounded bg-red-600 hover:bg-red-700 h-fit">Remove</button>
        </div>
      </div>

      <button @click="submitOverview" :disabled="submitting"
        class="w-full bg-linear-to-r from-[#aa8320] to-[#7b5902] text-white py-3 rounded font-semibold hover:from-[#cfa73a] transition disabled:opacity-50">
        {{ submitting ? 'Saving...' : 'Save Overview' }}
      </button>
    </div>

    <div v-if="displayOverview" class="grid md:grid-cols-2 gap-6">
      <div class="bg-zinc-800 p-4 rounded">
        <h3 class="font-bold text-white mb-3">Home Team Goals</h3>
        <div v-if="!displayOverview.homeGoals?.length" class="text-zinc-500 text-sm">No goals</div>
        <div v-for="(g, i) in displayOverview.homeGoals" :key="i" class="flex justify-between py-2 border-b border-zinc-700">
          <span>{{ getPlayerName(g.playerId, homePlayers) }}</span>
          <span class="text-zinc-400">{{ g.time }}'</span>
        </div>
      </div>
      <div class="bg-zinc-800 p-4 rounded">
        <h3 class="font-bold text-white mb-3">Away Team Goals</h3>
        <div v-if="!displayOverview.awayGoals?.length" class="text-zinc-500 text-sm">No goals</div>
        <div v-for="(g, i) in displayOverview.awayGoals" :key="i" class="flex justify-between py-2 border-b border-zinc-700">
          <span>{{ getPlayerName(g.playerId, awayPlayers) }}</span>
          <span class="text-zinc-400">{{ g.time }}'</span>
        </div>
      </div>
    </div>
  </div>
</template>