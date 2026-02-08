// 收藏接口 - 对应后端 /api/favorites（学生角色）

import defHttp from '../utils/request'

export interface FavoriteItem {
  id?: string
  _id?: string
  userId: string
  targetType: 'food' | 'merchant'
  targetId: string
  createdAt?: string
}

/** 收藏列表 */
export function getFavoriteList(params?: { targetType?: 'food' | 'merchant' }) {
  return defHttp.Get<FavoriteItem[]>('/api/favorites', params)
}

/** 收藏/取消收藏（toggle） */
export function toggleFavorite(targetType: 'food' | 'merchant', targetId: string) {
  return defHttp.Post<{ isFavorite: boolean }>('/api/favorites/toggle', { targetType, targetId })
}
