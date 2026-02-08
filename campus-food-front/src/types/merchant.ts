// 商家/店铺

export interface Merchant {
  id?: string
  _id?: string
  name: string
  logo?: string
  images?: string[]
  description?: string
  category?: string
  address?: string
  location?: { type: string; coordinates: number[] }
  contactName?: string
  contactPhone?: string
  businessHours?: string
  salesCount?: number
  rating?: number
  ratingCount?: number
  status?: 'open' | 'closed' | 'rest'
  createdAt?: string
  updatedAt?: string
}
