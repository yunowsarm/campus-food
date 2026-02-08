// 用户相关类型定义

export interface UserInfo {
  id: string
  nickName: string
  avatarUrl: string
  role: 'student' | 'merchant' | 'delivery' | null
  phone?: string
  email?: string
  gender?: number // 0-保密 1-男 2-女
  studentId?: string // 学号
  dormitory?: string // 宿舍地址
}

export interface UserState {
  userInfo: UserInfo | null
  role: 'student' | 'merchant' | 'delivery' | null
  token: string
  isLogin: boolean
}
