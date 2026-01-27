import axios from './axios'

export interface Player {
  id: number
  team_id: number
  nama_pemain: string
  posisi: string
}


// GET ALL PLAYERS
export const getPlayers = async (): Promise<Player[]> => {
  const response = await axios.get<Player[]>('/player')
  return response.data
}

// GET PLAYERS BY TEAM
export const getPlayersByTeam = async (teamId: number): Promise<Player[]> => {
  const res = await axios.get(`/player/team/${teamId}`)
  return res.data.data 
}

// CREATE PLAYER
export const createPlayer = async (data: {
  team_id: number
  nama_pemain: string
  posisi: string
}): Promise<Player> => {
  const res = await axios.post('/player', data)
  return res.data
}
