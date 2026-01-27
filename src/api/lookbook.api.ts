import api from './axios';

export interface Lookbook {
  id: number;
  name: string;
  slug: string;
  hero_image: string | null;
  products?: Product[];
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  images?: string[];
}

export interface LookbookFormData {
  name: string;
  slug?: string;
  hero_image?: string;
  products?: number[];
}

export const lookbookApi = {
  getAll: async (): Promise<Lookbook[]> => {
    const response = await api.get('/lookbooks');
    return response.data;
  },

  getById: async (id: number): Promise<Lookbook> => {
    const response = await api.get(`/lookbooks/${id}`);
    return response.data;
  },

  create: async (data: LookbookFormData): Promise<Lookbook> => {
    const response = await api.post('/lookbooks', data);
    return response.data;
  },

  update: async (id: number, data: LookbookFormData): Promise<Lookbook> => {
    const response = await api.put(`/lookbooks/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/lookbooks/${id}`);
  },

  getProducts: async (): Promise<Product[]> => {
    let allProducts: Product[] = [];
    let page = 1;
    let lastPage = 1;

    do {
      const response = await api.get('/products', { params: { page } });
      const data = response.data.data;
      allProducts.push(...data);

      lastPage = response.data.last_page || 1;
      page++;
    } while (page <= lastPage);

    return allProducts;
  }
};