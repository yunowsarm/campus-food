// 消息接口 - 对应后端 /api/messages

import defHttp from '../utils/request'
import type { Message } from '../types/message'

export interface MessageListParams {
  page?: number
  pageSize?: number
  isRead?: boolean
  type?: 'order' | 'group' | 'delivery' | 'system'
}

export interface MessageListResult {
  list: Message[]
  total: number
  page: number
  pageSize: number
}

/** 消息列表 */
export function getMessageList(params?: MessageListParams) {
  return defHttp.Get<MessageListResult>('/api/messages', params)
}

/** 消息详情 */
export function getMessageDetail(id: string) {
  return defHttp.Get<Message>(`/api/messages/${id}`)
}

/** 单条已读 */
export function readMessage(id: string) {
  return defHttp.Post<void>(`/api/messages/${id}/read`)
}

/** 全部已读 */
export function readAllMessages() {
  return defHttp.Post<void>('/api/messages/readAll')
}
