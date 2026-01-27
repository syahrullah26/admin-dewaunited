import axios from './axios'

export interface Team {
  id: number
  name: string
  stadium?: string
  logo?: string
  logo_url?: string
}

export interface PaginatedTeams {
  data: Team[]
  current_page: number
  last_page: number
}

export const getTeams = async (page = 1): Promise<PaginatedTeams> => {
  const res = await axios.get('/team', {
    params: { page },
  })
  return res.data
}

export const createTeam = async (formData: FormData): Promise<Team> => {
  const res = await axios.post('/team', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data
}

export const updateTeam = async (
  id: number,
  formData: FormData
): Promise<Team> => {
  const res = await axios.post(`/team/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data
}

export const getTeamsById = async(id: number): Promise<Team> => {
  const response = await axios.get<Team>(`/team/${id}`)
  return response.data
}

