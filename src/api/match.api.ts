import axios from './axios'

export interface Match {
  id: number
  match_date: string
  stadium: string
home_score: number | null
  away_score: number | null
  status: 'upcoming' | 'history'
  home_team: {
    id: number
    name: string
    logo : string
    logo_url?: string
  }
  away_team: {
    id: number
    name: string
    logo: string
    logo_url?: string
  }
}

export interface CreateMatchPayload {
  home_team_id: number
  away_team_id: number
  match_date: string
  home_score?: number | null
  away_score?: number | null
  status: 'upcoming' | 'history'
}

export interface PaginatedMatches {
  data: Match[]
  current_page: number
  last_page: number
}

export interface UpdateMatchPayload {
  home_team_id: number;
  away_team_id: number;
  match_date: string;
  status: string;
  home_score?: number | null;
  away_score?: number | null;
  home_possession?: number | null;
  away_possession?: number | null;
  home_shots?: number | null;
  away_shots?: number | null;
  home_fouls?: number | null;
  away_fouls?: number | null;
  home_corner?: number | null;
  away_corner?: number | null;
}

export const getMatches = async (page = 1): Promise<PaginatedMatches> => {
  const res = await axios.get('/matches', {
    params: { page },
  })
  return res.data
}

export const createMatch = async (payload: CreateMatchPayload): Promise<Match> => {
  const response = await axios.post<Match>('/matches', payload)
  return response.data
}

export const updateMatch = async (
  id: number,
  payload: UpdateMatchPayload
): Promise<Match> => {
  const response = await axios.put(`/matches/${id}`, payload)
  return response.data
}


export const deleteMatch = async (id: number): Promise<void> => {
  await axios.delete(`/matches/${id}`)
}

export const getMatchById = async (id: number): Promise<Match> => {
  const response = await axios.get<Match>(`/matches/${id}`)
  return response.data
}

export const getAllMatches = async (): Promise<Match[]> => {
  const res = await axios.get('/matches', {
    params: { per_page: 1000 },
  })
  return res.data.data
}