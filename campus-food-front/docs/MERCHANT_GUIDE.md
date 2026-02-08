# 商家端使用指南

## 一、商家端页面结构

商家端入口：登录后选择「商家」角色，自动跳转到 `/pages/merchant/home/index`

### 主要页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 商家首页 | `/pages/merchant/home/index` | 待处理订单、今日数据、快捷入口 |
| 订单管理 | `/pages/merchant/orders/index` | 订单列表（按状态筛选） |
| 菜品管理 | `/pages/merchant/foods/index` | 菜品列表、上下架、搜索 |
| 店铺设置 | `/pages/merchant/shop/index` | 店铺信息、营业状态 |
| 订单详情 | `/pages/merchant/order-detail/index` | 订单详情、接单、备餐、出餐 |
| 菜品编辑 | `/pages/merchant/food-edit/index` | 新增/编辑菜品 |
| 分类管理 | `/pages/merchant/category-manage/index` | 菜品分类增删改 |
| 数据统计 | `/pages/merchant/stats/index` | 销售统计、热门菜品 |

---

## 二、业务流程

### 订单处理流程

```
新订单通知 → 【开始备餐】 → 备餐中 → 【出餐完成】 → 自取完成 / 创建配送单
```

1. **商家首页/订单管理**：查看待处理订单（status=paid）
2. **点击「开始备餐」**：调用 `POST /api/orders/:id/startPreparing`，订单 status → preparing
3. **备餐完成后点击「出餐完成」**：调用 `POST /api/orders/:id/finishPreparing`
   - 若为「自取」：订单 status → completed
   - 若为「配送」：创建配送单（deliveries），订单 status → delivering，等待骑手送达

### 菜品管理流程

1. **菜品列表**：查看所有菜品，按分类筛选、搜索
2. **上下架**：toggle 开关，调用更新接口（TODO）
3. **新增菜品**：点击「+ 新增菜品」→ 填写表单 → 保存
4. **编辑菜品**：点击菜品卡片 → 修改信息 → 保存
5. **分类管理**：点击「管理分类」→ 增删改分类

### 店铺管理

- 修改店铺名称、logo、地址、联系方式、营业时间
- 切换营业状态（营业中/已打烊/休息中）

---

## 三、关键接口与调用

| 功能 | 接口 | 说明 |
|------|------|------|
| 订单列表 | `GET /api/orders?status=paid` | 获取待接单 |
| 开始备餐 | `POST /api/orders/:id/startPreparing` | status → preparing |
| 出餐完成 | `POST /api/orders/:id/finishPreparing` | 自取完成 / 创建配送单 |
| 菜品列表 | `GET /api/foods?merchantId=xxx` | 当前商家的菜品 |
| 创建菜品 | `POST /api/foods` | 需商家角色 |
| 更新菜品 | `PUT /api/foods/:id` | 上下架、修改信息 |
| 分类列表 | `GET /api/categories?merchantId=xxx` | 当前商家的分类 |
| 创建分类 | `POST /api/categories` | 需商家角色 |
| 更新店铺 | `PUT /api/merchants/:id` | 修改店铺信息 |

---

## 四、组件说明

### MerchantOrderCard

商家订单卡片，显示订单信息与操作按钮。

```vue
<MerchantOrderCard 
  :order="order" 
  @click="handleOrderClick"
  @startPreparing="handleStartPreparing"
  @finishPreparing="handleFinishPreparing"
/>
```

**Props:**
- `order: Order` - 订单对象

**Events:**
- `click` - 点击卡片
- `startPreparing` - 开始备餐
- `finishPreparing` - 出餐完成

### StatsCard

统计卡片，显示数据指标。

```vue
<StatsCard 
  label="今日订单" 
  :value="128" 
  icon="📦"
  trend="↑ 12%"
  type="primary"
/>
```

**Props:**
- `label: string` - 标签
- `value: string | number` - 数值
- `icon?: string` - 图标（默认 📊）
- `trend?: string` - 趋势（可选）
- `type?: 'default' | 'primary' | 'success' | 'warning'` - 样式类型

---

## 五、状态管理

### useMerchantStore

商家状态管理（`src/stores/merchant.ts`）

```ts
import { useMerchantStore } from '@/stores/merchant'

const merchantStore = useMerchantStore()

// 获取商家 ID
const merchantId = merchantStore.merchantId

// 设置商家信息
merchantStore.setMerchantInfo(merchantInfo)

// 设置营业状态
merchantStore.setOpenStatus(true)

// 清空
merchantStore.clear()
```

---

## 六、待完成功能（TODO）

以下功能已预留接口调用位置，需替换为真实后端接口：

1. **菜品上下架**：`PUT /api/foods/:id`（foods/index.vue 的 handleStatusChange）
2. **菜品创建/更新**：`POST/PUT /api/foods`（food-edit/index.vue 的 handleSave）
3. **店铺信息更新**：`PUT /api/merchants/:id`（shop/index.vue 的 handleSave）
4. **图片上传**：需对接图片上传接口（food-edit、shop 的上传图片）
5. **数据统计**：`GET /api/stats`（stats/index.vue 的 loadStats）

---

## 七、快速开始

1. 登录并选择「商家」角色
2. 进入商家首页，查看待处理订单
3. 点击「菜品管理」→「+ 新增菜品」，添加菜品
4. 点击「店铺设置」，完善店铺信息
5. 收到新订单后：开始备餐 → 出餐完成
6. 在「数据统计」查看销售情况

商家端与学生端、配送端共享同一套后端接口，通过角色（role）与权限（requireRole）区分访问权限。
