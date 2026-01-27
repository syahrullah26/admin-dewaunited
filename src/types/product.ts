export interface ProductColor {
  name: string;
  hex: string;
  images: string[];
}

export interface ProductBadge {
  icon: string;
  text: string;
}

export interface TechSpec {
  label: string;
  value: string;
}

export interface ShippingTier {
  tier: string;
  price: number;
  days: string;
}

export interface TrustBadge {
  icon: string;
  text: string;
}

export interface SizeGuide {
  size: string;
  chest: string;
  waist: string;
  length?: string;
}

export interface DetailImage {
  url: string;
  caption: string;
}

export interface ProductStock {
  size: string;
  stock: number;
}
export interface RelatedProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

export interface Product {
  id: number
  name: string
  slug: string

  category: string
  price: number
  original_price: number | null
  video_url: string | null

  images: string[]
  colors: ProductColor[]
  sizes: string[]
  stocks: ProductStock[]
  badges: ProductBadge[]

  description: string
  size_guide_desc: string
  
  shipping_info: ShippingTier[]
  trust_badges: TrustBadge[]
  size_guide: SizeGuide[]

  description_video_url: string | null
  detail_product: string | null

  detail_images: DetailImage[]
  lifestyle_images: string[]

  related_products: RelatedProduct[]

  is_active: boolean
  created_at?: string
  updated_at?: string
}


export interface ProductResponse {
  data: Product;
}