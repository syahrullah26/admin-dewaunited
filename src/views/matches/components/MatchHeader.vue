<script lang="ts" setup>
import type { Match } from '@/api/match.api'

defineProps<{ 
  match: Match | null
}>()

const formatDate = (d: string) => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(d))
}
</script>

<template>
  <div class="bg-zinc-900 p-6 rounded-lg shadow-md relative">
    <div v-if="match" class="space-y-4">
      
      <!-- BACK BUTTON -->
      <RouterLink
        to="/matches"
        class="absolute top-4 left-4 flex items-center gap-2
               text-sm px-3 py-2 rounded-md
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

      <h1 class="text-2xl font-bold text-center">Match Details</h1>

      <div class="text-center text-zinc-400">
        <span class="font-semibold">Date:</span>
        {{ formatDate(match.match_date) }}
      </div>

      <div class="bg-zinc-800 rounded-xl p-5 text-white">
        <div class="text-center text-sm text-zinc-400 mb-4">
          🏟️ {{ match.stadium }}
        </div>

        <div class="grid grid-cols-3 items-center text-center">
          <div>
            <img :src="match.home_team.logo_url" class="h-16 mx-auto mb-2" />
            <p class="text-sm font-semibold">{{ match.home_team.name }}</p>
          </div>

          <div class="text-3xl font-bold">
            {{ match.home_score ?? '-' }} : {{ match.away_score ?? '-' }}
          </div>

          <div>
            <img :src="match.away_team.logo_url" class="h-16 mx-auto mb-2" />
            <p class="text-sm font-semibold">{{ match.away_team.name }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center">Loading match header...</div>
  </div>
</template>
