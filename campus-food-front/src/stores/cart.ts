// 购物车状态管理

import { defineStore } from 'pinia'
import { CartItem } from '../types/food'
import { getStorage, setStorage } from '../utils/storage'
import { STORAGE_KEYS } from '../utils/constants'

interface CartState {
  items: CartItem[]
  selectedIds: string[]
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: getStorage<CartItem[]>(STORAGE_KEYS.CART) || [],
    selectedIds: []
  }),

  getters: {
    // 购物车商品总数
    totalCount: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    },

    // 购物车总价
    totalPrice: (state) => {
      return state.items.reduce((total, item) => {
        if (state.selectedIds.includes(item.id)) {
          return total + item.price * item.quantity
        }
        return total
      }, 0)
    },

    // 是否全选
    isAllSelected: (state) => {
      return state.items.length > 0 && state.selectedIds.length === state.items.length
    }
  },

  actions: {
    // 添加商品到购物车
    addItem(item: CartItem) {
      const existItem = this.items.find(i => i.foodId === item.foodId && i.spec === item.spec)
      if (existItem) {
        existItem.quantity += item.quantity
      } else {
        this.items.push(item)
      }
      this.saveCart()
    },

    // 更新商品数量
    updateQuantity(id: string, quantity: number) {
      const item = this.items.find(i => i.id === id)
      if (item) {
        if (quantity <= 0) {
          this.removeItem(id)
        } else {
          item.quantity = quantity
          this.saveCart()
        }
      }
    },

    // 移除商品
    removeItem(id: string) {
      const index = this.items.findIndex(i => i.id === id)
      if (index > -1) {
        this.items.splice(index, 1)
        // 同时移除选中状态
        const selectedIndex = this.selectedIds.indexOf(id)
        if (selectedIndex > -1) {
          this.selectedIds.splice(selectedIndex, 1)
        }
        this.saveCart()
      }
    },

    // 清空购物车
    clearCart() {
      this.items = []
      this.selectedIds = []
      this.saveCart()
    },

    // 切换选中状态
    toggleSelect(id: string) {
      const index = this.selectedIds.indexOf(id)
      if (index > -1) {
        this.selectedIds.splice(index, 1)
      } else {
        this.selectedIds.push(id)
      }
    },

    // 全选/取消全选
    toggleAllSelect() {
      if (this.isAllSelected) {
        this.selectedIds = []
      } else {
        this.selectedIds = this.items.map(item => item.id)
      }
    },

    // 保存购物车到本地
    saveCart() {
      setStorage(STORAGE_KEYS.CART, this.items)
    }
  }
})
