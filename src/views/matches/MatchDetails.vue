<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getMatchById, type Match } from '@/api/match.api'
import { getPlayersByTeam, type Player } from '@/api/player.api'
import { getMatchOverview } from '@/api/overview.api'
import axios from '@/api/axios'


import MatchHeader from './components/MatchHeader.vue'
import MatchStats from './components/MatchStats.vue'
import MatchOverview from './components/MatchOverview.vue'
import MatchLineup from './components/MatchLineup.vue'

const route = useRoute()
const matchId = route.params.id as string

const matchDetails = ref<Match | null>(null)
const homePlayers = ref<Player[]>([])
const awayPlayers = ref<Player[]>([])
const displayStats = ref(null)
const displayOverview = ref(null)
const displayHomeLineup = ref<any[]>([])
const displayAwayLineup = ref<any[]>([])

const loadAllData = async () => {
  try {
    const res = await getMatchById(Number(matchId))
    matchDetails.value = res
    
    if (res.home_team?.id && res.away_team?.id) {
      const [hPlayers, aPlayers] = await Promise.all([
        getPlayersByTeam(res.home_team.id),
        getPlayersByTeam(res.away_team.id)
      ])
      homePlayers.value = hPlayers
      awayPlayers.value = aPlayers
    }
    
    const [statsRes, ovRes, lineupRes] = await Promise.all([
      axios.get(`/matches/${matchId}/stats`),
      getMatchOverview(Number(matchId)),
      axios.get(`/matches/${matchId}/lineup`)
    ])

    displayStats.value = statsRes.data.data

    displayOverview.value = ovRes.data

    if (lineupRes.data.success && lineupRes.data.data) {
      const homeId = res.home_team.id
      const awayId = res.away_team.id
      displayHomeLineup.value = lineupRes.data.data.filter((l: any) => l.team_id === homeId)
      displayAwayLineup.value = lineupRes.data.data.filter((l: any) => l.team_id === awayId)
    }

  } catch (error) {
    console.error("Gagal memuat data detail pertandingan:", error)
  }
}

onMounted(() => loadAllData())
</script>

<template>
  <main class="max-w-7xl mx-auto px-4 py-8 space-y-6">
    <MatchHeader :match="matchDetails" />

    <div class="bg-zinc-900 p-6 rounded-lg shadow-md">
      <h1 class="text-xl text-white text-center mb-6">Match Control Panel</h1>
      
      <div class="bg-zinc-800 p-6 rounded-lg space-y-12">
        
        <MatchStats 
          :matchId="matchId" 
          :displayStats="displayStats" 
          @refresh="loadAllData" 
        />
        
        <hr class="border-zinc-700" />

        <MatchOverview 
          :matchId="matchId" 
          :homePlayers="homePlayers" 
          :awayPlayers="awayPlayers" 
          :displayOverview="displayOverview" 
          @refresh="loadAllData" 
        />
        
        <hr class="border-zinc-700" />

        <MatchLineup 
          :matchId="matchId"
          :homeTeamId="matchDetails?.home_team?.id"
          :awayTeamId="matchDetails?.away_team?.id"
          :homePlayers="homePlayers"
          :awayPlayers="awayPlayers"
          :displayHomeLineup="displayHomeLineup"
          :displayAwayLineup="displayAwayLineup"
          @refresh="loadAllData"
        />

      </div>
    </div>
  </main>
</template>