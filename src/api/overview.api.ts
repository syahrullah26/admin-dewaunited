import axios from './axios'

export interface GoalPayload {
  playerId: number
  time: number | null
}

export interface MatchOverviewPayload {
  homeGoals: GoalPayload[]
  awayGoals: GoalPayload[]
}

export const createMatchOverview = async (
  matchId: number,
  payload: MatchOverviewPayload
) => {
  const { data } = await axios.post(
    `/matches/${matchId}/overview`,
    payload
  )
  return data
}

export const getMatchOverview = async (matchId: number) => {
  const { data } = await axios.get(
    `/matches/${matchId}/overview`
  )
  return data
}
