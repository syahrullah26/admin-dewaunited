import api from './axios'
import type { Article, ArticleFormData, PaginatedResponse, ArticleFilters } from '@/types/article'

export const articleApi = {
  async getArticles(params: ArticleFilters = {}): Promise<PaginatedResponse<Article>> {
    const response = await api.get('/articles', { params })
    return response.data
  },

  async getArticle(id: number): Promise<Article> {
    const response = await api.get(`/articles/${id}`)
    return response.data
  },

  async createArticle(data: ArticleFormData): Promise<Article> {
    const response = await api.post('/articles', data)
    return response.data.data
  },

  async updateArticle(id: number, data: ArticleFormData): Promise<Article> {
    const response = await api.put(`/articles/${id}`, data)
    return response.data.data
  },

  async deleteArticle(id: number): Promise<void> {
    await api.delete(`/articles/${id}`)
  },
}