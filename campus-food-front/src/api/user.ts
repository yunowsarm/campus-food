// 用户接口 - 对应后端 /api/users

import defHttp from '../utils/request'
import type { UserInfo } from '../types/user'

export interface UserProfile {
  id: string
  email?: string
  nickName?: string
  avatarUrl?: string
  phone?: string
  role: string
  defaultAddressId?: string
  merchantId?: string
  deliveryStatus?: string
  status?: string
}

/** 获取个人资料 */
export function getProfile() {
  return defHttp.Get<UserProfile>('/api/users/profile')
}

/** 更新个人资料 */
export function updateProfile(data: Partial<Pick<UserInfo, 'nickName' | 'avatarUrl' | 'phone'>> & { defaultAddressId?: string }) {
  return defHttp.Put<UserProfile>('/api/users/profile', data)
}
