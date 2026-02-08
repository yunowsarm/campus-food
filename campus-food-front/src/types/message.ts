// 消息/通知

export interface Message {
  id: string
  _id?: string
  userId: string
  type: 'order' | 'group' | 'delivery' | 'system'
  title: string
  content: string
  relatedId?: string
  isRead: boolean
  createdAt: string
  updatedAt?: string
}

export interface MessageState {
  messageList: Message[]
  unreadCount: number
  currentMessage: Message | null
}
