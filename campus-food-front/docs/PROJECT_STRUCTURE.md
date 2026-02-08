# 项目结构说明

## 目录结构

```
campus-food/
├── src/
│   ├── api/                    # API 接口封装
│   │   ├── auth.ts            # 认证接口
│   │   ├── user.ts            # 用户接口
│   │   ├── merchants.ts       # 商家接口
│   │   ├── food.ts            # 菜品接口
│   │   ├── order.ts           # 订单接口
│   │   ├── group.ts           # 拼单接口
│   │   ├── deliveries.ts      # 配送接口
│   │   ├── addresses.ts       # 地址接口
│   │   ├── favorites.ts       # 收藏接口
│   │   ├── messages.ts        # 消息接口
│   │   └── categories.ts      # 分类接口
│   │
│   ├── components/            # 全局组件
│   │   ├── SearchBar/         # 搜索栏
│   │   ├── FoodCard/          # 菜品卡片
│   │   ├── MerchantOrderCard/ # 商家订单卡片
│   │   └── StatsCard/         # 统计卡片
│   │
│   ├── pages/                 # 页面
│   │   ├── auth/              # 认证页面
│   │   │   ├── login/         # 登录页
│   │   │   └── role-select/   # 角色选择
│   │   │
│   │   ├── student/           # 学生端（重构后）
│   │   │   ├── home/          # 首页
│   │   │   ├── category/      # 分类
│   │   │   ├── group/         # 拼单广场
│   │   │   ├── message/       # 消息
│   │   │   ├── mine/          # 我的
│   │   │   ├── food-detail/   # 美食详情
│   │   │   ├── group-detail/  # 拼单详情
│   │   │   ├── order-pay/     # 支付
│   │   │   ├── order-track/   # 订单跟踪
│   │   │   ├── order-list/    # 订单列表
│   │   │   └── favorite/      # 收藏
│   │   │
│   │   └── merchant/          # 商家端
│   │       ├── home/          # 商家首页
│   │       ├── orders/        # 订单管理
│   │       ├── foods/         # 菜品管理
│   │       ├── shop/          # 店铺设置
│   │       ├── order-detail/  # 订单详情
│   │       ├── food-edit/     # 菜品编辑
│   │       ├── category-manage/ # 分类管理
│   │       └── stats/         # 数据统计
│   │
│   ├── stores/                # 状态管理
│   │   ├── user.ts            # 用户状态
│   │   └── merchant.ts        # 商家状态
│   │
│   ├── types/                 # TypeScript 类型定义
│   │   ├── user.ts            # 用户类型
│   │   ├── food.ts            # 菜品类型
│   │   ├── order.ts           # 订单类型
│   │   ├── merchant.ts        # 商家类型
│   │   ├── address.ts         # 地址类型
│   │   └── message.ts         # 消息类型
│   │
│   ├── utils/                 # 工具函数
│   │   ├── request.ts         # HTTP 请求封装
│   │   ├── storage.ts         # 本地存储封装
│   │   ├── constants.ts       # 常量定义
│   │   └── index.ts           # 工具函数集合
│   │
│   ├── static/                # 静态资源
│   │   ├── tabbar/            # TabBar 图标
│   │   └── logo.png           # Logo
│   │
│   ├── App.vue                # 应用入口
│   ├── pages.json             # 页面路由配置
│   └── manifest.json          # 应用清单
│
├── scripts/                   # 脚本工具
│   ├── refactor-student-pages.ps1  # 重构脚本
│   ├── update-paths.ps1            # 路径更新脚本
│   ├── 重构学生端结构.bat          # 一键执行
│   └── README.md                    # 脚本说明
│
├── docs/                      # 文档
│   ├── MONGODB_DATABASE_DESIGN.md  # 数据库设计
│   ├── MERCHANT_GUIDE.md           # 商家端使用指南
│   ├── MERCHANT_PAGES.md           # 商家端页面规划
│   ├── REFACTOR_GUIDE.md           # 重构指南
│   └── PROJECT_STRUCTURE.md        # 项目结构说明（本文件）
│
└── package.json               # 项目配置

campus-food-back/              # 后端项目
├── src/
│   ├── config/                # 配置
│   │   └── db.js              # 数据库配置
│   │
│   ├── models/                # 数据模型
│   │   ├── User.js            # 用户模型
│   │   ├── Merchant.js        # 商家模型
│   │   ├── Food.js            # 菜品模型
│   │   ├── Order.js           # 订单模型
│   │   ├── Group.js           # 拼单模型
│   │   ├── Delivery.js        # 配送模型
│   │   ├── Address.js         # 地址模型
│   │   ├── Favorite.js        # 收藏模型
│   │   ├── Message.js         # 消息模型
│   │   └── Category.js        # 分类模型
│   │
│   ├── middleware/            # 中间件
│   │   ├── auth.js            # JWT 认证
│   │   └── errorHandler.js   # 错误处理
│   │
│   ├── controllers/           # 控制器
│   │   ├── authController.js  # 认证控制器
│   │   ├── userController.js  # 用户控制器
│   │   ├── merchantController.js  # 商家控制器
│   │   ├── foodController.js      # 菜品控制器
│   │   ├── orderController.js     # 订单控制器
│   │   ├── groupController.js     # 拼单控制器
│   │   ├── deliveryController.js  # 配送控制器
│   │   ├── addressController.js   # 地址控制器
│   │   ├── favoriteController.js  # 收藏控制器
│   │   ├── messageController.js   # 消息控制器
│   │   └── categoryController.js  # 分类控制器
│   │
│   ├── routes/                # 路由
│   │   ├── auth.js            # 认证路由
│   │   ├── users.js           # 用户路由
│   │   ├── merchants.js       # 商家路由
│   │   ├── foods.js           # 菜品路由
│   │   ├── orders.js          # 订单路由
│   │   ├── groups.js          # 拼单路由
│   │   ├── deliveries.js      # 配送路由
│   │   ├── addresses.js       # 地址路由
│   │   ├── favorites.js       # 收藏路由
│   │   ├── messages.js        # 消息路由
│   │   └── categories.js      # 分类路由
│   │
│   ├── utils/                 # 工具函数
│   │   └── seqNo.js           # 序列号生成
│   │
│   ├── app.js                 # Express 应用配置
│   └── server.js              # 服务器入口
│
├── docs/                      # 文档
│   ├── MONGODB_DATABASE_DESIGN.md  # 数据库设计
│   └── LOGIN_SETUP.md              # 登录配置说明
│
├── .env.example               # 环境变量示例
├── .gitignore                 # Git 忽略文件
├── package.json               # 项目配置
└── README.md                  # 项目说明
```

---

## 功能模块

### 学生端

| 模块     | 页面                   | 功能                                 |
| -------- | ---------------------- | ------------------------------------ |
| 首页     | `student/home`         | 搜索、轮播图、分类快捷入口、推荐美食 |
| 分类     | `student/category`     | 菜品分类浏览、筛选                   |
| 拼单     | `student/group`        | 拼单广场、创建/加入拼单              |
| 消息     | `student/message`      | 系统消息、订单消息                   |
| 我的     | `student/mine`         | 个人信息、订单、收藏、地址           |
| 美食详情 | `student/food-detail`  | 菜品详情、加入购物车、立即购买       |
| 拼单详情 | `student/group-detail` | 拼单信息、参与拼单                   |
| 支付     | `student/order-pay`    | 订单支付                             |
| 订单跟踪 | `student/order-track`  | 订单实时跟踪                         |
| 订单列表 | `student/order-list`   | 我的订单列表                         |
| 收藏     | `student/favorite`     | 我的收藏列表                         |

### 商家端

| 模块     | 页面                       | 功能                           |
| -------- | -------------------------- | ------------------------------ |
| 首页     | `merchant/home`            | 待处理订单、今日数据、快捷入口 |
| 订单管理 | `merchant/orders`          | 订单列表、接单、备餐、出餐     |
| 菜品管理 | `merchant/foods`           | 菜品列表、上下架、编辑         |
| 店铺设置 | `merchant/shop`            | 店铺信息、营业状态             |
| 订单详情 | `merchant/order-detail`    | 订单详细信息、操作             |
| 菜品编辑 | `merchant/food-edit`       | 新增/编辑菜品                  |
| 分类管理 | `merchant/category-manage` | 分类增删改                     |
| 数据统计 | `merchant/stats`           | 销售统计、热门菜品             |

---

## 技术栈

### 前端

- **框架**: uni-app (Vue 3 + TypeScript)
- **状态管理**: Pinia
- **UI 组件**: 自定义组件
- **网络请求**: uni.request (封装为 defHttp)
- **样式**: SCSS

### 后端

- **框架**: Express.js
- **数据库**: MongoDB + Mongoose
- **认证**: JWT (jsonwebtoken)
- **跨域**: CORS
- **环境变量**: dotenv

---

## 命名规范

### 文件命名

- **页面**: `kebab-case` (如 `food-detail/index.vue`)
- **组件**: `PascalCase` (如 `FoodCard/FoodCard.vue`)
- **工具**: `camelCase` (如 `request.ts`, `storage.ts`)
- **类型**: `PascalCase` (如 `User.ts`, `Food.ts`)

### 路径命名

- **学生端**: `/pages/student/xxx`
- **商家端**: `/pages/merchant/xxx`
- **认证**: `/pages/auth/xxx`

---

## 开发规范

1. **组件化**: 可复用的UI拆分为组件
2. **类型安全**: 使用 TypeScript 定义类型
3. **统一请求**: 使用 `defHttp` 封装
4. **状态管理**: 使用 Pinia store
5. **路由规范**: 遵循目录结构命名

---

更多详情请查看各模块的详细文档。
