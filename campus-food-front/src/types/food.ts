// 美食相关类型定义

export interface Food {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  categoryId: string;
  merchantId: string;
  merchantName: string;
  merchantAvatar?: string;
  sales: number;
  rating: number;
  description?: string;
  tags?: string[];
  isFavorite?: boolean;
  status?: string;
  stock?: number;
}

export interface FoodCategory {
  id: string;
  name: string;
  icon?: string;
  index: number;
}

export interface CartItem {
  id: string;
  foodId: string;
  foodName: string;
  foodImage: string;
  price: number;
  quantity: number;
  spec?: string;
}

export interface FoodListParams {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  merchantId?: string;
  keyword?: string;
}

export interface FoodListResult {
  list: Food[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateFoodParams {
  merchantId: string;
  name: string;
  categoryId?: string;
  description?: string;
  images?: string[];
  price: number;
  originalPrice?: number;
  stock?: number;
  tags?: string[];
  status?: "on" | "off";
}

export type UpdateFoodParams = Omit<CreateFoodParams, "merchantId">;
