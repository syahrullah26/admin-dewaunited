import axios from 'axios'

export interface Activation {
  id: number
  title: string
  slug: string
  category: string
  excerpt: string
  content: string
  cover_image: string
  gallery?: string[] | null
  location?: string | null
  start_date?: string | null
  end_date?: string | null
}

export interface PaginatedActivations {
  data: Activation[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export const getActivations = async (
  category?: string
): Promise<PaginatedActivations> => {
  const response = await axios.get('/activations', {
    params: category ? { category } : {}
  })

  return response.data.data
}

export const addActivation = async (
  payload: FormData
): Promise<Activation> => {
  const response = await axios.post('/activations', payload)
  return response.data.data
}
