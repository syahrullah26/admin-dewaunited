<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { createMatch, getMatches, updateMatch } from '@/api/match.api'
import type { Match } from '@/api/match.api'
import { getTeams } from '@/api/team.api'
import type { Team } from '@/api/team.api'
// import { B } from 'vue-router/dist/router-CWoNjPRp.mjs'

defineOptions({ name: 'MatchListView' })

/* ================= STATE ================= */
const matches = ref<Match[]>([])
const teams = ref<Team[]>([])
const loading = ref(false)
const submitting = ref(false)
const showCreateForm = ref(false)

/* ================= EDIT MODE ================= */
const isEditMode = ref(false)
const editingMatchId = ref<number | null>(null)

/* ================= FORM ================= */
const homeTeamID = ref<number | null>(null)
const awayTeamID = ref<number | null>(null)
const matchDate = ref<string>('')
const home_score = ref<number | null>(null)
const away_score = ref<number | null>(null)

/* ================= TAB ================= */
const activeTab = ref<'upcoming' | 'history'>('upcoming')

/* ================= HELPERS ================= */
const getStatusByDate = (date: string): 'upcoming' | 'history' => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const match = new Date(date)
  match.setHours(0, 0, 0, 0)

  return match < today ? 'history' : 'upcoming'
}

/* ================= FETCH ================= */
const loadTeams = async () => {
  const res = await getTeams()
  teams.value = res.data
}

const loadMatches = async () => {
  loading.value = true
  try {
    const res = await getMatches()
    matches.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadTeams()
  await loadMatches()
})

/* ================= FILTER ================= */
const filteredMatches = computed(() => {
  return matches.value.filter((m) => getStatusByDate(m.match_date) === activeTab.value)
})

/* ================= EDIT ================= */
const startEdit = (match: Match) => {
  showCreateForm.value = true
  isEditMode.value = true
  editingMatchId.value = match.id

  homeTeamID.value = match.home_team.id
  awayTeamID.value = match.away_team.id
  matchDate.value = match.match_date
  home_score.value = match.home_score
  away_score.value = match.away_score
}

/* ================= SUBMIT ================= */
const submitMatch = async () => {
  if (!homeTeamID.value || !awayTeamID.value || !matchDate.value) {
    alert('All fields are required')
    return
  }

  if (homeTeamID.value === awayTeamID.value) {
    alert('Home and Away team cannot be the same')
    return
  }

  submitting.value = true

  try {
    const status = getStatusByDate(matchDate.value)

    const payload = {
      home_team_id: homeTeamID.value,
      away_team_id: awayTeamID.value,
      match_date: matchDate.value,
      status,
      home_score: status === 'history' ? home_score.value : null,
      away_score: status === 'history' ? away_score.value : null,
    }

    if (isEditMode.value && editingMatchId.value) {
      await updateMatch(editingMatchId.value, payload)
    } else {
      await createMatch(payload)
    }

    // RESET
    homeTeamID.value = null
    awayTeamID.value = null
    matchDate.value = ''
    home_score.value = null
    away_score.value = null
    isEditMode.value = false
    editingMatchId.value = null
    showCreateForm.value = false

    await loadMatches()
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="max-w-7xl mx-auto px-4 py-8">
    <!-- CREATE / EDIT -->
    <div class="bg-zinc-900 p-6 rounded-lg space-y-6">
      <!-- HEADER -->
      <div class="relative flex items-center justify-between">
        <!-- LEFT : BACK -->
        <RouterLink
          to="/"
          class="flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-linear-to-r from-[#aa8320] to-[#7b5902] hover:from-[#cfa73a] hover:to-[#7b5902] text-white transition"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </RouterLink>

        <!-- CENTER : TITLE -->
        <h1 class="absolute left-1/2 -translate-x-1/2 text-white text-xl font-semibold">
          {{ isEditMode ? 'Edit Match' : 'Create Match' }}
        </h1>

        <!-- RIGHT : SHOW / HIDE -->
        <button
          @click="showCreateForm = !showCreateForm"
          class="text-sm px-3 py-2 rounded-md border border-zinc-700 text-gray-300 hover:bg-zinc-800 transition"
        >
          {{ showCreateForm ? 'Hide' : 'Show' }}
        </button>
      </div>
      <hr class="border-[#aa8320]" />

      <div v-if="showCreateForm" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select v-model="homeTeamID" class="form-input">
            <option disabled value="null">Home Team</option>
            <option v-for="t in teams" :key="t.id" :value="t.id">
              {{ t.name }}
            </option>
          </select>

          <select v-model="awayTeamID" class="form-input">
            <option disabled value="null">Away Team</option>
            <option v-for="t in teams" :key="t.id" :value="t.id">
              {{ t.name }}
            </option>
          </select>
        </div>

        <input v-model="matchDate" type="date" class="form-input w-full" />

        <div class="grid grid-cols-2 gap-4">
          <input
            v-model.number="home_score"
            type="number"
            placeholder="Home Score"
            class="form-input"
          />

          <input
            v-model.number="away_score"
            type="number"
            placeholder="Away Score"
            class="form-input"
          />
        </div>

        <button
          @click="submitMatch"
          :disabled="submitting"
          class="w-full bg-linear-to-r from-[#aa8320] to-[#7b5902] text-white py-3 rounded font-semibold"
        >
          {{ submitting ? 'Saving...' : isEditMode ? 'Update Match' : 'Create Match' }}
        </button>
      </div>
    </div>

    <!-- TABS -->
    <div class="flex gap-4 mt-8">
      <button
        @click="activeTab = 'upcoming'"
        :class="activeTab === 'upcoming' ? 'bg-[#aa8320]' : 'bg-zinc-800'"
        class="px-4 py-2 rounded text-white"
      >
        Upcoming
      </button>
      <button
        @click="activeTab = 'history'"
        :class="activeTab === 'history' ? 'bg-[#aa8320]' : 'bg-zinc-800'"
        class="px-4 py-2 rounded text-white"
      >
        History
      </button>
    </div>

    <!-- MATCH LIST -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      <div
        v-for="match in filteredMatches"
        :key="match.id"
        class="bg-zinc-800 rounded-xl p-5 text-white space-y-4"
      >
        <div class="flex justify-between text-sm text-zinc-400">
          <span>📅 {{ match.match_date }}</span>
          <span
            class="px-2 py-1 rounded text-white text-xs font-semibold"
            :class="
              getStatusByDate(match.match_date) === 'upcoming' ? 'bg-blue-600' : 'bg-green-600'
            "
          >
            {{ getStatusByDate(match.match_date) }}
          </span>
        </div>

        <div class="grid grid-cols-3 items-center text-center">
          <div>
            <img :src="match.home_team.logo_url" class="h-12 mx-auto" />
            <p class="text-sm">{{ match.home_team.name }}</p>
          </div>

          <div class="text-xl font-bold">
            <span v-if="getStatusByDate(match.match_date) === 'history'">
              {{ match.home_score }} : {{ match.away_score }}
            </span>
            <span v-else>vs</span>
          </div>

          <div>
            <img :src="match.away_team.logo_url" class="h-12 mx-auto" />
            <p class="text-sm">{{ match.away_team.name }}</p>
          </div>
        </div>

        <div class="text-center text-sm text-zinc-400">🏟️ {{ match.stadium }}</div>

        <div class="flex justify-between">
          <Button
            @click="$router.push(`/matches/${match.id}`)"
            class="px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700"
          >
            🔍 Match Stats
          </Button>
          <button
            @click="startEdit(match)"
            class="px-3 py-1 text-xs rounded bg-yellow-600 hover:bg-yellow-700"
          >
            ✏️ Edit
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
