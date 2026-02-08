// 商家状态管理

import { defineStore } from 'pinia'
import type { Merchant } from '../types/merchant'

export interface MerchantState {
  merchantInfo: Merchant | null
  isOpen: boolean
}

export const useMerchantStore = defineStore('merchant', {
  state: (): MerchantState => ({
    merchantInfo: null,
    isOpen: true
  }),

  getters: {
    merchantId: (state) => state.merchantInfo?._id || state.merchantInfo?.id || null
  },

  actions: {
    setMerchantInfo(info: Merchant) {
      this.merchantInfo = info
    },

    setOpenStatus(isOpen: boolean) {
      this.isOpen = isOpen
    },

    clear() {
      this.merchantInfo = null
      this.isOpen = true
    }
  }
})
