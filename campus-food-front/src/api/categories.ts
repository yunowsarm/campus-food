// 分类接口 - 对应后端 /api/categories

import defHttp from "../utils/request";
import type { FoodCategory } from "../types/food";

export interface CategoryItem {
  id?: string;
  _id?: string;
  name: string;
  icon?: string;
  index?: number;
  merchantId?: string | null;
}

/** 分类列表（可选 merchantId 查某商家分类） */
export function getCategoryList(params?: { merchantId?: string }) {
  return defHttp.Get<CategoryItem[]>("/api/categories", params);
}

/** 创建分类（商家角色） */
export function createCategory(data: Partial<CategoryItem>) {
  return defHttp.Post<CategoryItem>("/api/categories", data);
}

/** 更新分类（商家角色） */
export function updateCategory(id: string, data: Partial<CategoryItem>) {
  return defHttp.Put<CategoryItem>(`/api/categories/${id}`, data);
}

/** 删除分类（商家角色） */
export function removeCategory(id: string) {
  return defHttp.Delete(`/api/categories/${id}`);
}
