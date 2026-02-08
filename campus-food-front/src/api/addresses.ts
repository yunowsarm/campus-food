// 地址接口 - 对应后端 /api/addresses（学生角色）

import defHttp from '../utils/request'
import type { Address } from '../types/address'

export interface CreateAddressParams {
  name: string
  phone: string
  region?: string
  detail?: string
  location?: [number, number] // [lng, lat]
  isDefault?: boolean
}

export interface UpdateAddressParams extends Partial<CreateAddressParams> {}

/** 地址列表 */
export function getAddressList() {
  return defHttp.Get<Address[]>('/api/addresses')
}

/** 新增地址 */
export function createAddress(data: CreateAddressParams) {
  return defHttp.Post<Address>('/api/addresses', data)
}

/** 更新地址 */
export function updateAddress(id: string, data: UpdateAddressParams) {
  return defHttp.Put<Address>(`/api/addresses/${id}`, data)
}

/** 删除地址 */
export function removeAddress(id: string) {
  return defHttp.Delete(`/api/addresses/${id}`)
}
