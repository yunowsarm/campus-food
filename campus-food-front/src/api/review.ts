// 评价接口 - 对应后端 /api/reviews

import defHttp from '../utils/request'

export interface ReviewItem {
  id: string
  userId: string
  targetType: 'food' | 'merchant'
  targetId: string
  orderId?: string
  rating: number
  content?: string
  images?: string[]
  reply?: string
  replyAt?: string
  status: string
  likeCount: number
  createdAt: string
  user?: { nickName?: string; avatarUrl?: string }
  targetName?: string
  targetImage?: string
}

export interface ReviewListResult {
  list: ReviewItem[]
  total: number
  page: number
  pageSize: number
}

/** 提交评价 */
export function createReview(data: {
  orderId: string
  targetType: 'food' | 'merchant'
  targetId: string
  rating: number
  content?: string
  images?: string[]
}) {
  return defHttp.Post<ReviewItem>('/api/reviews', data)
}

/** 评价列表 */
export function getReviewList(params: {
  targetType?: string
  targetId?: string
  page?: number
  pageSize?: number
}) {
  return defHttp.Get<ReviewListResult>('/api/reviews', params)
}

/** 美食评价列表 */
export function getFoodReviews(foodId: string, params?: { page?: number; pageSize?: number }) {
  return defHttp.Get<ReviewListResult>(`/api/foods/${foodId}/reviews`, params)
}

/** 热门评价 */
export function getHotReviews(limit?: number) {
  return defHttp.Get<{ list: ReviewItem[] }>('/api/reviews/hot', { limit })
}

/** 商家回复评价 */
export function replyReview(id: string, reply: string) {
  return defHttp.Put<ReviewItem>(`/api/reviews/${id}/reply`, { reply })
}
