# SyncChatWindow 研究原型说明文档

## 📋 概述

`sync-chat-window.html` 是主窗口的研究原型页面，用于验证主窗口的 HTML 结构和 CSS 样式。与纯静态的研究原型不同，这个页面通过引用编译后的 JavaScript 文件，实现了完整的交互功能。

**文件路径**: `research/sync-chat-window.html`

**生成源**: `src/sync-chat-window.js`

---

## 🎯 设计目的

1. **HTML/CSS 验证**: 验证主窗口的 DOM 结构和样式是否正确
2. **交互测试**: 测试主窗口的完整交互功能
3. **独立运行**: 验证主窗口能够独立运行，不依赖外部环境

---

## 🔑 关键特性

### 外部脚本引用

```html
<script src="../dist/main-window-initializer.bundle.js"></script>
```

**这是核心设计**：页面引用了编译后的 JavaScript bundle 文件。

### 独立运行机制

主窗口通过以下机制实现无依赖独立运行：

1. **嵌入初始化脚本**: 在 `src/sync-chat-window.js` 中，初始化脚本通过模板字符串直接嵌入到 HTML 中
2. **Webpack 占位符替换**: 使用 Webpack 插件将编译后的代码替换到占位符位置

**源码中的占位符** (`src/sync-chat-window.js:302`):
```javascript
const initScriptTemplate = `
    console.log('Initializing main window.');
    debugger;
    window.mainWindowName = '${this.MULTI_AI_CHAT_MAIN_WINDOW}';
    // INSERT_MAIN_WINDOW_INDEX_JS_HERE  ← 占位符
    console.log('Main window initialized.');
`;
```

**Webpack 配置** (`webpack.userscript.js` 或相关配置):
```javascript
new webpack.DefinePlugin({
    __MAIN_WINDOW_INITIALIZER_SCRIPT__: require('./src/main-window-initializer.js')
})
```

最终生成的 HTML 中，占位符会被替换为实际的初始化代码。

---

## 🏗️ 文件结构

### HTML 结构

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Multi AI Chat</title>
    <style>
        /* 内联 CSS 样式 */
    </style>
</head>
<body>
    <div id="root">
        <div class="main-window">
            <!-- 标题栏 -->
            <header class="main-title-bar">...</header>

            <!-- 内容区 -->
            <main class="content-area">...</main>

            <!-- 输入区 -->
            <footer class="prompt-area">...</footer>
        </div>
    </div>

    <!-- 初始化脚本 (嵌入) -->
    <script>...</script>

    <!-- 调试面板 -->
    <div>...</div>
</body>
</html>
```

### CSS 来源

HTML 中的 `<style>` 标签内容直接来自 `src/sync-chat-window.js` 中的 `_addStyles()` 函数（第 29-227 行）。

这个函数返回完整的 CSS 字符串，包含：
- 主窗口样式（标题栏、内容区、输入区）
- ChatArea 样式（对话面板、消息气泡、索引栏等）

---

## 🔧 构建流程

### 1. 源文件结构

```
src/
├── sync-chat-window.js          # 主窗口 HTML/CSS 生成
├── main-window-initializer.js   # 主窗口初始化逻辑
└── main-window-controller.js    # 主窗口控制器
```

### 2. Webpack 编译

```
sync-chat-window.js
    ↓
Webpack 编译
    ↓
dist/main-window-initializer.bundle.js  (包含初始化代码)
```

### 3. 运行时流程

```
1. 用户在 AI 页面点击"同步对比"按钮
    ↓
2. PageController 调用 syncChatWindow.checkAndCreateWindow()
    ↓
3. SyncChatWindow 使用 window.open() 创建新窗口
    ↓
4. SyncChatWindow.createWindow() 写入完整的 HTML 内容
    ↓
5. 新窗口执行嵌入的初始化脚本
    ↓
6. MainWindowController 初始化，主窗口可交互
```

---

## 🧪 使用方式

### 开发模式

1. 修改 `src/` 中的源文件
2. 运行构建命令：
   ```bash
   npm run research:build
   ```
3. 刷新 `research/sync-chat-window.html` 查看效果

### 生产模式

主窗口在运行时动态创建，不使用静态 HTML 文件。`research/sync-chat-window.html` 仅用于开发验证。

---

## 📝 调试功能

页面右下角的固定面板显示初始化脚本内容，用于调试：

```html
<div style="position: fixed; top: 10px; right: 10px; ...">
    <textarea id="raw">...</textarea>
</div>
```

这个面板在 `src/sync-chat-window.js` 的 `createWindow()` 方法中生成（第 319-332 行），显示：
- 嵌入的初始化脚本源码
- 占位符替换后的实际代码

---

## 🔗 相关文件

| 文件 | 说明 |
|------|------|
| `src/sync-chat-window.js` | 主窗口 HTML/CSS 生成源码 |
| `src/main-window-initializer.js` | 主窗口初始化逻辑 |
| `src/main-window-controller.js` | 主窗口控制器 |
| `dist/main-window-initializer.bundle.js` | 编译后的初始化代码 |
| `research/main-window.html` | 静态主窗口原型（无 JS 交互） |
| `research/main-window.research.js` | 主窗口研究脚本 |

---

## ⚠️ 注意事项

1. **不要直接编辑**: `sync-chat-window.html` 是生成的文件，修改源文件应修改 `src/sync-chat-window.js`

2. **构建依赖**: 修改源文件后必须重新构建才能看到效果

3. **占位符**: `// INSERT_MAIN_WINDOW_INDEX_JS_HERE` 是 Webpack 替换标记，不要手动修改

4. **调试面板**: 生产环境中会移除右下角的调试面板

---

## 📚 相关文档

- `research/main-window.research.md` - MainWindow 研究成果详解
- `research/chat-area.research.md` - ChatArea 研究成果详解
- `design/architect.md` - 总体架构设计
