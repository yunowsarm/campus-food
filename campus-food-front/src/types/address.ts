// 收货地址

export interface Address {
  id?: string
  _id?: string
  userId: string
  name: string
  phone: string
  region?: string
  detail?: string
  location?: { type: string; coordinates: number[] }
  isDefault?: boolean
  createdAt?: string
  updatedAt?: string
}
