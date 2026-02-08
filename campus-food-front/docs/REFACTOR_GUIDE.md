# 项目重构指南 - 学生端页面整理

## 一、重构目标

将学生端页面统一整理到 `/pages/student` 目录下，使项目结构更清晰：

```
pages/
├── auth/              # 认证相关（保持不变）
│   ├── login
│   └── role-select
├── student/           # 学生端（新增）
│   ├── home           # 首页
│   ├── category       # 分类
│   ├── group          # 拼单广场
│   ├── message        # 消息
│   ├── mine           # 我的
│   ├── food-detail    # 美食详情
│   ├── group-detail   # 拼单详情
│   ├── order-pay      # 支付
│   ├── order-track    # 订单跟踪
│   ├── order-list     # 订单列表
│   └── favorite       # 收藏
└── merchant/          # 商家端（已完成）
    ├── home
    ├── orders
    ├── foods
    └── ...
```

---

## 二、文件迁移清单

### 主 Tab 页面

| 旧路径                     | 新路径                             |
| -------------------------- | ---------------------------------- |
| `pages/home/index.vue`     | `pages/student/home/index.vue`     |
| `pages/category/index.vue` | `pages/student/category/index.vue` |
| `pages/group/index.vue`    | `pages/student/group/index.vue`    |
| `pages/message/index.vue`  | `pages/student/message/index.vue`  |
| `pages/mine/index.vue`     | `pages/student/mine/index.vue`     |

### 子页面

| 旧路径                     | 新路径                                 |
| -------------------------- | -------------------------------------- |
| `pages/food/detail.vue`    | `pages/student/food-detail/index.vue`  |
| `pages/group/detail.vue`   | `pages/student/group-detail/index.vue` |
| `pages/order/pay.vue`      | `pages/student/order-pay/index.vue`    |
| `pages/order/track.vue`    | `pages/student/order-track/index.vue`  |
| `pages/order/list.vue`     | `pages/student/order-list/index.vue`   |
| `pages/favorite/index.vue` | `pages/student/favorite/index.vue`     |

---

## 三、手动迁移步骤

### 方式一：手动创建目录并移动文件（推荐）

```bash
# 1. 创建 student 目录结构
cd campus-food/src/pages
mkdir -p student/home student/category student/group student/message student/mine
mkdir -p student/food-detail student/group-detail student/order-pay student/order-track student/order-list student/favorite

# 2. 移动文件（Windows PowerShell）
Move-Item home\index.vue student\home\index.vue
Move-Item category\index.vue student\category\index.vue
Move-Item group\index.vue student\group\index.vue
Move-Item message\index.vue student\message\index.vue
Move-Item mine\index.vue student\mine\index.vue

Move-Item food\detail.vue student\food-detail\index.vue
Move-Item group\detail.vue student\group-detail\index.vue
Move-Item order\pay.vue student\order-pay\index.vue
Move-Item order\track.vue student\order-track\index.vue
Move-Item order\list.vue student\order-list\index.vue
Move-Item favorite\index.vue student\favorite\index.vue

# 3. 删除空目录
Remove-Item home, category, group, message, mine, food, order, favorite -Force
```

### 方式二：使用 IDE 重构功能

1. 在 VS Code 中选中文件
2. 右键 → 重命名/移动
3. 输入新路径 `student/home/index.vue`
4. IDE 会自动更新所有引用

---

## 四、需要更新的文件

重构完成后，需要更新以下文件中的路径引用：

### 1. **pages.json**（已自动更新）

所有页面路径已更新为新路径

### 2. **App.vue**

```javascript
// 修改前
const homePath =
  userStore.role === "student"
    ? "/pages/home/index"
    : "/pages/merchant/home/index";

// 修改后
const homePath =
  userStore.role === "student"
    ? "/pages/student/home/index"
    : "/pages/merchant/home/index";
```

### 3. **role-select.vue**

```javascript
// 修改前
const homePath =
  role === "student" ? "/pages/home/index" : "/pages/merchant/home/index";

// 修改后
const homePath =
  role === "student"
    ? "/pages/student/home/index"
    : "/pages/merchant/home/index";
```

### 4. **login.vue**

```javascript
// 修改前
const homePath =
  user.role === "student" ? "/pages/home/index" : "/pages/merchant/home/index";

// 修改后
const homePath =
  user.role === "student"
    ? "/pages/student/home/index"
    : "/pages/merchant/home/index";
```

### 5. **页面内的跳转路径**

需要全局搜索并替换以下路径：

```bash
# 搜索模式          → 替换为
/pages/home/index         → /pages/student/home/index
/pages/category/index     → /pages/student/category/index
/pages/group/index        → /pages/student/group/index
/pages/message/index      → /pages/student/message/index
/pages/mine/index         → /pages/student/mine/index
/pages/food/detail        → /pages/student/food-detail/index
/pages/group/detail       → /pages/student/group-detail/index
/pages/order/pay          → /pages/student/order-pay/index
/pages/order/track        → /pages/student/order-track/index
/pages/order/list         → /pages/student/order-list/index
/pages/favorite/index     → /pages/student/favorite/index
```

**涉及的文件：**

- `pages/student/home/index.vue` - 搜索、分类跳转
- `pages/student/category/index.vue` - 美食详情跳转
- `pages/student/mine/index.vue` - 订单列表、收藏跳转
- 等等...

---

## 五、自动化脚本（可选）

创建 `scripts/refactor-student-pages.js`：

```javascript
const fs = require("fs");
const path = require("path");

const fileMap = {
  "pages/home/index.vue": "pages/student/home/index.vue",
  "pages/category/index.vue": "pages/student/category/index.vue",
  // ... 添加所有映射
};

const pathReplacements = {
  "/pages/home/index": "/pages/student/home/index",
  "/pages/category/index": "/pages/student/category/index",
  // ... 添加所有替换
};

// 1. 移动文件
Object.entries(fileMap).forEach(([oldPath, newPath]) => {
  const src = path.join(__dirname, "../src", oldPath);
  const dest = path.join(__dirname, "../src", newPath);

  // 创建目录
  fs.mkdirSync(path.dirname(dest), { recursive: true });

  // 移动文件
  fs.renameSync(src, dest);
  console.log(`✅ ${oldPath} → ${newPath}`);
});

// 2. 更新路径引用
function updatePathsInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let updated = false;

  Object.entries(pathReplacements).forEach(([oldPath, newPath]) => {
    if (content.includes(oldPath)) {
      content = content.replaceAll(oldPath, newPath);
      updated = true;
    }
  });

  if (updated) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ 更新: ${filePath}`);
  }
}

// 遍历所有 .vue 和 .ts 文件
// ... 实现文件遍历和更新

console.log("✅ 重构完成！");
```

运行：

```bash
node scripts/refactor-student-pages.js
```

---

## 六、验证清单

重构完成后，请检查：

- [ ] 所有文件已移动到新目录
- [ ] `pages.json` 路由配置已更新
- [ ] tabBar 路径已更新
- [ ] App.vue 中的路径已更新
- [ ] 所有页面内的跳转路径已更新
- [ ] 小程序可以正常运行
- [ ] 所有页面可以正常访问
- [ ] tabBar 切换正常
- [ ] 页面跳转正常

---

## 七、回滚方案

如果重构出现问题，可以：

1. 使用 Git 回滚：`git checkout .`
2. 或手动恢复文件到原位置
3. 恢复 `pages.json` 配置

---

## 八、注意事项

1. **备份代码**：重构前务必提交或备份代码
2. **逐步测试**：每移动一个模块后测试一次
3. **团队协作**：通知团队成员路径变更
4. **文档更新**：更新项目文档中的路径说明

---

**建议**：先在开发分支测试，确认无误后再合并到主分支。
