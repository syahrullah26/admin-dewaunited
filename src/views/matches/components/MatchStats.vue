<script lang="ts" setup>
import { ref, watch } from 'vue'
import axios from '@/api/axios'

const props = defineProps<{
  matchId: string
  displayStats: any
}>()

const emit = defineEmits(['refresh'])

const showForm = ref(false)
const submitting = ref(false)

const homePossession = ref(props.displayStats?.home_possession || 0)
const awayPossession = ref(props.displayStats?.away_possession || 0)
const homeShots = ref(props.displayStats?.home_shots || 0)
const awayShots = ref(props.displayStats?.away_shots || 0)
const homeFouls = ref(props.displayStats?.home_fouls || 0)
const awayFouls = ref(props.displayStats?.away_fouls || 0)
const homeCorner = ref(props.displayStats?.home_corner || 0)
const awayCorner = ref(props.displayStats?.away_corner || 0)

watch(homePossession, (val) => {
  if (val > 100) homePossession.value = 100
  awayPossession.value = 100 - homePossession.value
})

const submitStats = async () => {
  submitting.value = true
  try {
    await axios.post('/stats', {
      match_id: Number(props.matchId),
      home_possession: homePossession.value,
      away_possession: awayPossession.value,
      home_shots: homeShots.value,
      away_shots: awayShots.value,
      home_fouls: homeFouls.value,
      away_fouls: awayFouls.value,
      home_corner: homeCorner.value,
      away_corner: awayCorner.value,
    })
    alert('Stats berhasil disimpan!')
    emit('refresh')
  } catch (e) {
    alert('Gagal menyimpan stats')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <div class="text-center mb-4">
      <h3 class="text-lg font-bold text-white mb-4">STATS</h3>
      <button @click="showForm = !showForm" class="text-sm px-3 py-2 rounded-md border border-zinc-700 text-gray-300 hover:bg-zinc-700">
        {{ showForm ? 'Hide Form' : 'Show Form' }}
      </button>
    </div>

    <div v-if="showForm" class="space-y-4 mb-8">
      <div class="grid md:grid-cols-2 gap-4">
        <div><label class="form-label">Home Possession (%)</label><input v-model.number="homePossession" type="number" class="form-input" /></div>
        <div><label class="form-label">Away Possession (%)</label><input v-model.number="awayPossession" type="number" class="form-input" readonly /></div>
        <div><label class="form-label">Home Shots</label><input v-model.number="homeShots" type="number" class="form-input" /></div>
        <div><label class="form-label">Away Shots</label><input v-model.number="awayShots" type="number" class="form-input" /></div>
        </div>
      <button @click="submitStats" :disabled="submitting" class="w-full bg-linear-to-r from-[#aa8320] to-[#7b5902] text-white py-3 rounded font-semibold">
        {{ submitting ? 'Saving...' : 'Save Stats' }}
      </button>
    </div>

    <div v-if="displayStats" class="grid md:grid-cols-4 gap-4 text-center mt-6">
      <div v-for="(val, label) in { Possession: displayStats.home_possession + '% - ' + displayStats.away_possession + '%', Shots: displayStats.home_shots + ' - ' + displayStats.away_shots, Fouls: displayStats.home_fouls + ' - ' + displayStats.away_fouls, Corners: displayStats.home_corner + ' - ' + displayStats.away_corner }" :key="label" class="bg-zinc-800 p-4 rounded">
        <div class="text-zinc-400 text-sm">{{ label }}</div>
        <div class="text-xl font-bold text-white mt-2">{{ val }}</div>
      </div>
    </div>
  </div>
</template>