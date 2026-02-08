// 订单状态管理

import { defineStore } from 'pinia'
import { Order, OrderState, OrderStats } from '../types/order'

export const useOrderStore = defineStore('order', {
  state: (): OrderState => ({
    currentOrder: null,
    orderList: [],
    orderStats: {
      unpaid: 0,
      undelivered: 0,
      completed: 0,
      refunded: 0
    }
  }),

  getters: {
    // 待付款订单
    unpaidOrders: (state) => {
      return state.orderList.filter(order => order.status === 'unpaid')
    },

    // 待收货订单
    undeliveredOrders: (state) => {
      return state.orderList.filter(order => 
        order.status === 'paid' || 
        order.status === 'preparing' || 
        order.status === 'delivering'
      )
    },

    // 已完成订单
    completedOrders: (state) => {
      return state.orderList.filter(order => order.status === 'completed')
    }
  },

  actions: {
    // 设置当前订单
    setCurrentOrder(order: Order | null) {
      this.currentOrder = order
    },

    // 设置订单列表
    setOrderList(orders: Order[]) {
      this.orderList = orders
      this.updateOrderStats()
    },

    // 添加订单
    addOrder(order: Order) {
      this.orderList.unshift(order)
      this.updateOrderStats()
    },

    // 更新订单
    updateOrder(orderId: string, updates: Partial<Order>) {
      const index = this.orderList.findIndex(o => o.id === orderId)
      if (index > -1) {
        this.orderList[index] = { ...this.orderList[index], ...updates }
        this.updateOrderStats()
      }
      
      if (this.currentOrder && this.currentOrder.id === orderId) {
        this.currentOrder = { ...this.currentOrder, ...updates }
      }
    },

    // 更新订单统计
    updateOrderStats() {
      this.orderStats = {
        unpaid: this.unpaidOrders.length,
        undelivered: this.undeliveredOrders.length,
        completed: this.completedOrders.length,
        refunded: this.orderList.filter(o => o.status === 'refunded').length
      }
    }
  }
})
