export interface Article {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string
  banner_image: string | null
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string[] | null
  view_count: number
  created_at: string
  updated_at: string
}

export interface ArticleFormData {
  title: string
  slug?: string
  excerpt?: string
  content: string
  banner_image?: string
  status: 'draft' | 'published' | 'archived'
  published_at?: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  prev_page_url: string | null
  next_page_url: string | null
}

export interface ArticleFilters {
  search?: string
  status?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

export interface ValidationErrors {
  [key: string]: string[]
}