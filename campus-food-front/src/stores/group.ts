// 拼单状态管理

import { defineStore } from 'pinia'
import { Group, GroupDetail, GroupState } from '../types/group'

export const useGroupStore = defineStore('group', {
  state: (): GroupState => ({
    currentGroup: null,
    myGroups: [],
    nearbyGroups: []
  }),

  getters: {
    // 我发起的拼单
    myCreatedGroups: (state) => {
      return state.myGroups.filter(group => group.status === 'pending')
    },

    // 我参与的拼单
    myJoinedGroups: (state) => {
      return state.myGroups.filter(group => group.status === 'pending')
    }
  },

  actions: {
    // 设置当前拼单
    setCurrentGroup(group: GroupDetail | null) {
      this.currentGroup = group
    },

    // 设置我的拼单列表
    setMyGroups(groups: Group[]) {
      this.myGroups = groups
    },

    // 设置附近的拼单列表
    setNearbyGroups(groups: Group[]) {
      this.nearbyGroups = groups
    },

    // 添加拼单
    addGroup(group: Group) {
      this.nearbyGroups.unshift(group)
    },

    // 更新拼单
    updateGroup(groupId: string, updates: Partial<Group>) {
      // 更新当前拼单
      if (this.currentGroup && this.currentGroup.id === groupId) {
        this.currentGroup = { ...this.currentGroup, ...updates }
      }
      
      // 更新我的拼单列表
      const myIndex = this.myGroups.findIndex(g => g.id === groupId)
      if (myIndex > -1) {
        this.myGroups[myIndex] = { ...this.myGroups[myIndex], ...updates }
      }

      // 更新附近的拼单列表
      const nearbyIndex = this.nearbyGroups.findIndex(g => g.id === groupId)
      if (nearbyIndex > -1) {
        this.nearbyGroups[nearbyIndex] = { ...this.nearbyGroups[nearbyIndex], ...updates }
      }
    },

    // 移除拼单
    removeGroup(groupId: string) {
      this.myGroups = this.myGroups.filter(g => g.id !== groupId)
      this.nearbyGroups = this.nearbyGroups.filter(g => g.id !== groupId)
      if (this.currentGroup && this.currentGroup.id === groupId) {
        this.currentGroup = null
      }
    }
  }
})
