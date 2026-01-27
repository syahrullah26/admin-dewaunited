import api from './axios'
/* ================= TYPES ================= */

export interface ProductVariant {
  sku: string
  color: string
  size: string
  price: number
  stock: number
  thumbnail?: string
}

export interface ProductMedia {
  type: 'image' | 'video' | 'highlight' | 'lifestyle'
  url: string
  caption?: string
}

export interface ProductSizeGuide {
  size: string
  chest: number
  length: number
}

export interface ProductFormData {
  name: string
  slug: string
  tagline: string
  base_price: number
  features_content: string
  care_instructions: string
  detail_product?: string
  description_video?: string
  is_active: boolean

  variants: any[]
  media: any[]
  size_guides: any[]
  related_products: number[]
}

/* ================= API ================= */

// LIST (PAGINATED)
export const getProducts = (page = 1) =>
  api.get(`/products?page=${page}`)

export const getAdminProduct = (id: number | string) => {
  return api.get(`/admin/products/${id}`)
}
// DETAIL (PUBLIC / BY SLUG)
export const getProductBySlug = (slug: string) =>
  api.get(`/products/${slug}`)

// CREATE (ADMIN)
export const createProduct = (data: ProductFormData) => {
  return api.post('/admin/products', data)
}
// UPDATE (ADMIN)
export const updateProduct = (id: number, data: ProductFormData) => {
  return api.put(`/admin/products/${id}`, data)
}
// DELETE (ADMIN)
export const deleteProduct = (id: number) =>
  api.delete(`/admin/products/${id}`)