# TabBar图标说明

请在此目录下放置以下图标文件：

## 命名规则

- **`-static`** 后缀：未激活状态（未选中）的图标
- **`-act`** 后缀：激活状态（选中/点击后）的图标

## 需要的图标文件

1. **hanbao-static.svg** / **hanbao-act.svg** - 首页图标（未选中/选中）
2. **fenlei-static.svg** / **fenlei-act.svg** - 分类图标（未选中/选中）
3. **pingdan-static.svg** / **pingdan-act.svg** - 拼单图标（未选中/选中）
4. **xiaoxi-static.svg** / **xiaoxi-act.svg** - 消息图标（未选中/选中）
5. **wode-static.svg** / **wode-act.svg** - 我的图标（未选中/选中）

## 图标规格

- 尺寸：81px × 81px（建议使用2倍图）
- 格式：SVG（支持透明背景，推荐）或 PNG
- 颜色：
  - 未选中状态（-static）：灰色 (#999999)
  - 选中状态（-act）：主题色 (#667eea)

## 图标建议

可以使用以下emoji或图标库：
- IconFont
- Font Awesome
- Material Icons
- 或使用emoji作为占位符

## 临时方案

如果暂时没有图标，可以使用emoji作为占位符，在pages.json中暂时注释掉iconPath和selectedIconPath，使用text-only模式。
