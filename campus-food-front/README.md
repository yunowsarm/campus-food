# 校园美食推荐与拼单平台

基于 uniapp + Vue3 + TypeScript 开发的微信小程序前端项目。

## 项目结构

```
src/
├── api/                    # API接口层（mock数据，预留接口位置）
│   ├── auth.ts            # 登录授权接口
│   ├── food.ts            # 美食相关接口
│   ├── group.ts           # 拼单相关接口
│   ├── order.ts           # 订单相关接口
│   └── user.ts            # 用户相关接口
├── components/            # 公共组件
│   ├── FoodCard/          # 美食卡片组件
│   ├── GroupCard/         # 拼单卡片组件
│   ├── OrderCard/         # 订单卡片组件
│   └── SearchBar/         # 搜索栏组件
├── stores/                # Pinia状态管理
│   ├── user.ts           # 用户状态
│   ├── cart.ts           # 购物车状态
│   ├── order.ts          # 订单状态
│   └── group.ts          # 拼单状态
├── utils/                 # 工具函数
│   ├── request.ts        # 请求封装
│   ├── storage.ts        # 本地存储封装
│   ├── format.ts         # 格式化工具
│   └── constants.ts      # 常量定义
├── types/                 # TypeScript类型定义
│   ├── user.ts
│   ├── food.ts
│   ├── group.ts
│   └── order.ts
└── pages/                 # 页面
    ├── auth/              # 授权相关
    │   ├── login.vue     # 微信授权登录页
    │   └── role-select.vue # 角色选择页
    ├── home/              # 首页（美食推荐）
    ├── category/          # 分类页
    ├── group/             # 拼单相关
    │   ├── index.vue     # 拼单广场
    │   └── detail.vue    # 拼单详情页
    ├── message/           # 消息页
    ├── mine/              # 我的
    ├── food/              # 美食相关
    │   └── detail.vue    # 美食详情页
    ├── order/             # 订单相关
    │   ├── pay.vue       # 支付页面
    │   ├── track.vue     # 订单跟踪
    │   └── list.vue      # 订单列表
    └── favorite/          # 收藏夹
```

## 功能特性

### 学生端功能

1. **首页（美食推荐）**
   - 轮播图推荐
   - 美食分类快捷入口
   - 推荐美食列表
   - 下拉刷新、上拉加载更多

2. **分类页**
   - 搜索功能
   - 分类筛选
   - 美食列表展示

3. **拼单广场**
   - 拼单列表展示
   - 配送方式筛选
   - 拼单进度显示
   - 倒计时显示

4. **拼单详情页（核心）**
   - 拼单进度展示
   - 配送方式选择（单独配送/集体配送/到店取餐）
   - 参与用户列表
   - 发起拼单/参与拼单功能
   - 分享邀请功能

5. **美食详情页**
   - 美食图片轮播
   - 基本信息展示
   - 收藏功能
   - 单独购买/发起拼单

6. **订单流程**
   - 支付页面
   - 订单跟踪
   - 订单列表（待付款、待收货、已完成等）

7. **我的页面**
   - 用户信息展示
   - 订单入口
   - 收藏夹入口
   - 我的拼单入口

8. **消息页**
   - 拼单通知
   - 订单通知
   - 系统通知

9. **收藏夹**
   - 收藏的美食
   - 收藏的商家

## 技术栈

- **框架**: uniapp 3.0
- **语言**: TypeScript
- **UI框架**: Vue 3 (Composition API)
- **状态管理**: Pinia
- **构建工具**: Vite

## 开发指南

### 安装依赖

```bash
npm install
```

### 开发运行

```bash
# 微信小程序
npm run dev:mp-weixin

# H5
npm run dev:h5
```

### 构建

```bash
# 微信小程序
npm run build:mp-weixin

# H5
npm run build:h5
```

## 重要说明

### 1. API接口

当前所有API接口都使用mock数据，实际开发时需要：

1. 在 `src/api/` 目录下的各个文件中替换mock数据为实际接口调用
2. 在 `src/utils/request.ts` 中配置实际的API基础地址
3. 根据后端接口文档调整请求参数和响应数据结构

### 2. TabBar图标

需要在 `src/static/tabbar/` 目录下放置以下图标文件：

- home.png / home-active.png
- category.png / category-active.png
- group.png / group-active.png
- message.png / message-active.png
- mine.png / mine-active.png

图标规格：81px × 81px（建议使用2倍图）

如果暂时没有图标，可以：
1. 使用emoji作为占位符
2. 在 `pages.json` 中暂时注释掉 `iconPath` 和 `selectedIconPath`，使用纯文字模式

### 3. 微信授权登录

当前登录流程使用mock数据，实际开发时需要：

1. 配置微信小程序AppID
2. 实现真实的微信登录接口
3. 处理token刷新逻辑

### 4. 支付功能

支付功能当前使用mock数据，实际开发时需要：

1. 配置微信支付参数
2. 实现真实的支付接口
3. 处理支付回调

### 5. 图片资源

项目中使用的图片路径（如 `/static/logo.png`）需要：

1. 将实际图片资源放置在 `src/static/` 目录下
2. 或使用网络图片URL

## 用户流程

### 首次进入流程

1. 打开小程序 → 检查本地角色
2. 无角色 → 微信授权登录 → 角色选择 → 保存角色 → 进入对应首页
3. 有角色 → 直接进入对应首页

### 购买流程

**路径1（单独购买）**：
首页/分类页 → 美食详情 → 单独购买 → 支付 → 订单跟踪

**路径2（参与拼单）**：
首页/分类页 → 美食详情 → 参与拼单 → 拼单详情页 → 支付 → 等待成团 → 订单跟踪
或
拼单广场 → 拼单详情页 → 参与拼单 → 支付 → 等待成团 → 订单跟踪

**路径3（发起拼单）**：
美食详情 → 发起拼单 → 拼单详情页 → 支付 → 分享邀请 → 等待成团 → 订单跟踪

## 待开发功能

- [ ] 商家端功能
- [ ] 地址管理功能
- [ ] 设置页面
- [ ] 关于我们页面
- [ ] 商家详情页
- [ ] 评价功能
- [ ] 优惠券功能
- [ ] 配送跟踪地图

## 注意事项

1. 所有价格以分为单位存储，显示时需要除以100
2. 时间格式统一使用ISO字符串格式
3. 使用rpx作为尺寸单位，适配不同屏幕
4. 使用Pinia进行状态管理，避免直接操作本地存储
5. API接口统一使用 `src/utils/request.ts` 封装的请求方法

## 许可证

MIT License
