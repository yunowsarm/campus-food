// 消息状态管理

import { defineStore } from 'pinia'
import { Message, MessageState } from '../types/message'
import { getMessageList, readMessage, readAllMessages } from '../api/messages'
import type { MessageListParams } from '../api/messages'

let pollingTimer: ReturnType<typeof setInterval> | null = null

function normalizeMessage(msg: any): Message {
  return {
    ...msg,
    id: msg.id || msg._id,
    title: msg.title ?? '',
    content: msg.content ?? '',
    isRead: msg.isRead ?? false,
  }
}

export const useMessageStore = defineStore('message', {
  state: (): MessageState => ({
    messageList: [],
    unreadCount: 0,
    currentMessage: null,
  }),

  actions: {
    // 设置当前消息
    setCurrentMessage(message: Message | null) {
      this.currentMessage = message
    },

    // 获取消息列表
    async getMessageList(params?: MessageListParams) {
      const res = await getMessageList(params) as { list: any[]; total: number; page: number; pageSize: number }
      const list = (res.list || []).map(normalizeMessage)
      return { list, total: res.total ?? 0, page: res.page ?? 1, pageSize: res.pageSize ?? 10 }
    },

    // 设置消息列表（页面用）
    setMessageList(list: Message[]) {
      this.messageList = list
    },

    // 标记单条已读
    async markAsRead(messageId: string) {
      await readMessage(messageId)
      const item = this.messageList.find((m) => m.id === messageId)
      if (item) item.isRead = true
      if (this.unreadCount > 0) this.unreadCount--
      if (this.currentMessage?.id === messageId) this.currentMessage = { ...this.currentMessage, isRead: true }
      this.syncTabBarBadge()
    },

    // 标记全部已读
    async markAllAsRead() {
      await readAllMessages()
      this.messageList.forEach((m) => (m.isRead = true))
      this.unreadCount = 0
      this.syncTabBarBadge()
    },

    // 更新未读数（通过拉取未读列表的 total）
    async updateUnreadCount() {
      try {
        const res = await getMessageList({ page: 1, pageSize: 1, isRead: false }) as { total?: number }
        this.unreadCount = res.total ?? 0
        this.syncTabBarBadge()
      } catch {
        // 静默失败
      }
    },

    // 同步 TabBar 消息角标（消息 tab 为 index 2）
    syncTabBarBadge() {
      try {
        if (this.unreadCount > 0) {
          uni.setTabBarBadge({
            index: 2,
            text: this.unreadCount > 99 ? '99+' : String(this.unreadCount),
          })
        } else {
          uni.removeTabBarBadge({ index: 2 })
        }
      } catch {
        // 非 tabBar 页面可能报错，忽略
      }
    },

    // 启动轮询（每 60 秒更新未读数）
    startPolling() {
      if (pollingTimer) return
      pollingTimer = setInterval(() => {
        this.updateUnreadCount()
      }, 60000)
    },

    // 停止轮询
    stopPolling() {
      if (pollingTimer) {
        clearInterval(pollingTimer)
        pollingTimer = null
      }
    },
  },
})
