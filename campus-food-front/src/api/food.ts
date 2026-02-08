// 美食接口 - 对应后端 /api/foods、/api/categories

import defHttp from "../utils/request";
import type { RequestConfig } from "../utils/request";
import type {
  Food,
  FoodCategory,
  FoodListParams,
  FoodListResult,
  CreateFoodParams,
  UpdateFoodParams,
} from "../types/food";

/** 美食列表（支持 keyword 搜索）；config 可传 showLoading: false 做静默刷新 */
export function getFoodList(params?: FoodListParams, config?: RequestConfig) {
  return defHttp.Get<FoodListResult>("/api/foods", params, config);
}

/** 个性化推荐列表 */
export function getRecommendations(params?: { page?: number; pageSize?: number }) {
  return defHttp.Get<FoodListResult>("/api/foods/recommendations", params);
}

/** 美食详情 */
export function getFoodDetail(id: string) {
  return defHttp.Get<Food>(`/api/foods/${id}`);
}

/** 搜索美食 */
export function searchFood(
  keyword: string,
  params?: Omit<FoodListParams, "keyword">
) {
  return defHttp.Get<FoodListResult>("/api/foods", { ...params, keyword });
}

/** 美食分类（走分类接口） */
export function getFoodCategories(params?: { merchantId?: string }) {
  return defHttp.Get<FoodCategory[]>("/api/categories", params);
}

/** 切换收藏 */
export function toggleFavorite(foodId: string) {
  return defHttp.Post<{ isFavorite: boolean }>("/api/favorites/toggle", {
    targetType: "food",
    targetId: foodId,
  });
}

/** 创建菜品 */
export function createFood(data: CreateFoodParams) {
  return defHttp.Post<Food>("/api/foods", data);
}

/** 更新菜品 */
export function updateFood(id: string, data: Partial<UpdateFoodParams>) {
  return defHttp.Put<Food>(`/api/foods/${id}`, data);
}

/** 删除菜品 */
export function deleteFood(id: string) {
  return defHttp.Delete<void>(`/api/foods/${id}`);
}
