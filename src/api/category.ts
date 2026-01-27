import axios from './axios'

export interface Category {
  id: number
  name: string
  slug: string
}

export const getCategory = async (): Promise<Category[]> => {
  const response = await axios.get(`/category`)
  return response.data.data
}

export const saveCategory = async (data: { name: string }): Promise<Category> => {
  const response = await axios.post(`/category`, data)
  return response.data.data
}
