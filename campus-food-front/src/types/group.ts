// 拼单相关类型定义

export type DeliveryType = 'alone' | 'together' | 'pickup'

export interface Participant {
  id: string
  userId: string
  nickName: string
  avatarUrl: string
  joinTime: string
  deliveryType: DeliveryType
  address?: string
}

export interface Group {
  id: string
  foodId: string
  foodName: string
  foodImage: string
  price: number
  originalPrice?: number
  targetNum: number
  currentNum: number
  deliveryType: DeliveryType
  endTime: string
  creatorId: string
  creatorName: string
  creatorAvatar: string
  participants: Participant[]
  status: 'pending' | 'success' | 'failed' | 'cancelled'
  createdAt: string
}

export interface GroupDetail extends Group {
  food: {
    id: string
    name: string
    images: string[]
    description?: string
    merchantId: string
    merchantName: string
  }
  remainingTime: number // 剩余时间（秒）
}

export interface GroupState {
  currentGroup: GroupDetail | null
  myGroups: Group[]
  nearbyGroups: Group[]
}
