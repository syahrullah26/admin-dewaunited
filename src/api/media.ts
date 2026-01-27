import axios from './axios'

export interface Media {
  id: number
  file_name: string
  file_path: string
  mime_path: string
  type: 'image' | 'video'
  product_id: number | null
}

export const getMedia = async (): Promise<Media[]> => {
  const response = await axios.get('/media')
  return response.data
}

export const uploadMedia = async (files: File[]): Promise<Media[]> => {
  const formData = new FormData()

  files.forEach((file) => {
    formData.append('files[]', file)
  })
  const response = await axios.post('/media/upload', formData)
  return response.data.data
}
