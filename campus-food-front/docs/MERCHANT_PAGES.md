# 商家端页面规划

## 页面结构

### 主 Tab 页面（商家专用）
1. **merchant/home** - 商家首页（待接单、今日统计）
2. **merchant/orders** - 订单管理（新订单、备餐中、配送中、已完成）
3. **merchant/foods** - 菜品管理（列表、上下架、编辑）
4. **merchant/shop** - 店铺管理（信息、营业状态）

### 子页面
1. **merchant/order-detail** - 订单详情（接单、备餐、出餐）
2. **merchant/food-edit** - 菜品编辑/新增
3. **merchant/category-manage** - 分类管理
4. **merchant/stats** - 统计报表

## 路由配置（pages.json）

```json
{
  "path": "pages/merchant/home/index",
  "path": "pages/merchant/orders/index",
  "path": "pages/merchant/foods/index",
  "path": "pages/merchant/shop/index",
  "path": "pages/merchant/order-detail/index",
  "path": "pages/merchant/food-edit/index",
  "path": "pages/merchant/category-manage/index",
  "path": "pages/merchant/stats/index"
}
```

## 组件

- **MerchantOrderCard** - 商家订单卡片（显示订单状态、操作按钮）
- **FoodEditForm** - 菜品表单（名称、价格、图片、库存等）
- **StatsCard** - 统计卡片（销售额、订单量等）
