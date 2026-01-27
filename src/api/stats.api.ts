import axios from './axios'

export interface MatchStatsPayload {
  homePossession: number | null
  awayPossession: number | null
  homeShots: number | null
  awayShots: number | null
  homeFouls: number | null
  awayFouls: number | null
  homeCorner: number | null
  awayCorner: number | null
}

export const createMatchStats = async (
  matchId: number,
  payload: MatchStatsPayload
) => {
  const { data } = await axios.post(
    `/matches/${matchId}/stats`,
    payload
  )
  return data
}

export const getMatchStats = async (matchId: number) => {
  const { data } = await axios.get(
    `/matches/${matchId}/stats`
  )
  return data
}
