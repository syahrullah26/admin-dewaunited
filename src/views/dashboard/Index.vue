<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { getMatches } from '@/api/match.api'
import { getTeams } from '@/api/team.api'
import type { Match } from '@/api/match.api'
import type { Team } from '@/api/team.api'

defineOptions({ name: 'DashboardView' })

/* ================= STATE ================= */
const matches = ref<Match[]>([])
const teams = ref<Team[]>([])
const loading = ref(false)

/* ================= FETCH ================= */
const loadDashboardData = async () => {
  loading.value = true
  try {
    const [matchRes, teamRes] = await Promise.all([
      getMatches(),
      getTeams(),
    ])

    matches.value = matchRes.data
    teams.value = teamRes.data
  } finally {
    loading.value = false
  }
}

/* ================= COMPUTED STATS ================= */
const totalMatches = computed(() => matches.value.length)

const upcomingMatches = computed(() =>
  matches.value.filter(m => m.status === 'upcoming').length
)

const finishedMatches = computed(() =>
  matches.value.filter(m => m.status === 'history').length
)

const totalTeams = computed(() => teams.value.length)

/* ================= UPCOMING MATCH ================= */
const upcomingMatch = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return matches.value
    .filter(m => new Date(m.match_date) >= today)
    .sort(
      (a, b) =>
        new Date(a.match_date).getTime() -
        new Date(b.match_date).getTime()
    )[0]
})

onMounted(loadDashboardData)
</script>

<template>
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

    <!-- HEADER -->
    <section class="bg-zinc-900 rounded-sm p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
      <h1 class="text-white text-xl font-semibold">Dashboard</h1>
      <p class="text-zinc-400 text-sm">
        Welcome to admin dashboard
      </p>
    </section>

    <!-- STATS CARDS -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-zinc-900 rounded-lg p-5 border border-zinc-800">
        <p class="text-zinc-400 text-sm">Total Matches</p>
        <h3 class="text-3xl font-bold text-white mt-2">
          {{ totalMatches }}
        </h3>
      </div>

      <div class="bg-zinc-900 rounded-lg p-5 border border-zinc-800">
        <p class="text-zinc-400 text-sm">Upcoming Matches</p>
        <h3 class="text-3xl font-bold text-blue-500 mt-2">
          {{ upcomingMatches }}
        </h3>
      </div>

      <div class="bg-zinc-900 rounded-lg p-5 border border-zinc-800">
        <p class="text-zinc-400 text-sm">Finished Matches</p>
        <h3 class="text-3xl font-bold text-green-500 mt-2">
          {{ finishedMatches }}
        </h3>
      </div>

      <div class="bg-zinc-900 rounded-lg p-5 border border-zinc-800">
        <p class="text-zinc-400 text-sm">Total Teams</p>
        <h3 class="text-3xl font-bold text-[#aa8320] mt-2">
          {{ totalTeams }}
        </h3>
      </div>
    </section>

    <!-- UPCOMING MATCH -->
    <section class="bg-zinc-900 rounded-sm p-6">
      <h2 class="text-white text-lg font-semibold mb-4 text-center">
        Upcoming Match
      </h2>

      <p v-if="loading" class="text-center text-zinc-400">
        Loading match...
      </p>

      <div
        v-else-if="upcomingMatch"
        class="space-y-4"
      >
        <div class="text-center text-zinc-400 text-sm">
          <p>{{ upcomingMatch.match_date }}</p>
          <p>🏟️ {{ upcomingMatch.stadium }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4 items-center text-center">
          <!-- HOME -->
          <div class="flex flex-col items-center gap-2">
            <img
              :src="upcomingMatch.home_team.logo_url"
              class="h-16 w-16 object-contain"
            />
            <p class="text-white font-medium">
              {{ upcomingMatch.home_team.name }}
            </p>
          </div>

          <!-- AWAY -->
          <div class="flex flex-col items-center gap-2">
            <img
              :src="upcomingMatch.away_team.logo_url"
              class="h-16 w-16 object-contain"
            />
            <p class="text-white font-medium">
              {{ upcomingMatch.away_team.name }}
            </p>
          </div>
        </div>
      </div>

      <p
        v-else
        class="text-center text-zinc-400"
      >
        Tidak ada match upcoming
      </p>
    </section>

  </main>
</template>
