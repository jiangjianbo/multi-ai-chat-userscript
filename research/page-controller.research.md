# PageController 研究成果说明文档

## 📋 研究概述

本研究旨在探索如何在原生 AI 聊天页面中注入 UI 元素，为现有页面添加增强功能而不破坏原有布局。研究成果指导 `PageController` 如何在第三方 AI 网站上安全、美观地注入脚本。

**研究文件**:
- `page-controller.html` - 模拟 AI 聊天页面的原型

**应用目标**:
- `src/page-controller.js` - 原生页面控制器实现

---

## 🎯 研究目标

1. **UI 注入策略**: 研究如何在第三方页面上安全注入自定义元素
2. **视觉隔离**: 确保注入的元素与原页面风格协调但明显区分
3. **位置策略**: 研究固定定位、绝对定位和流式布局的最佳实践
4. **交互设计**: 设计悬浮工具条、索引导航等增强功能
5. **样式冲突预防**: 确保注入样式不影响原页面

---

## 🏗️ 核心研究成果

### 1. 模拟页面结构

研究构建了一个典型的 AI 聊天页面布局：

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (260px)  │  Main Content Area (弹性宽度)       │
│  - History        │  ┌─────────────────────────────────┐│
│  - New Chat       │  │ Header                          ││
│                   │  │ [Model Name]    [Sync Button]  ││
│                   │  ├─────────────────────────────────┤│
│                   │  │                                 ││
│                   │  │  Chat Area (滚动区域)           ││
│                   │  │  ┌─────────────────────────┐   ││
│                   │  │  │ [索引工具条]            │   ││ ← 固定定位
│                   │  │  ├─────────────────────────┤   ││
│                   │  │  │ Q: 问题1                │   ││
│                   │  │  │    [工具条]            │   ││ ← 悬浮工具条
│                   │  │  ├─────────────────────────┤   ││
│                   │  │  │ A: 回答1                │   ││
│                   │  │  │    [工具条]            │   ││
│                   │  │  └─────────────────────────┘   ││
│                   │  ├─────────────────────────────────┤│
│                   │  │ Input Area                     ││
│                   │  │ [输入框]                        ││
│                   │  └─────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 2. 三大注入元素

#### 2.1 同步按钮 (Sync Button)

**位置**: 页面头部右上角
**定位方式**: `position: fixed`

```css
.injected-sync-button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 9999;
}
```

**设计要点**:
- 使用固定定位确保始终可见
- 高 z-index (9999) 确保在所有元素之上
- 圆角设计使其明显区别于原页面按钮
- 蓝色背景突出显示

**交互**: 点击触发 `handleSyncButtonClick()`

#### 2.2 问答工具条 (Q&A Toolbar)

**位置**: 每个问答块顶部，悬浮显示
**定位方式**: `position: absolute` (相对于问答块)

```css
.injected-qna-toolbar {
    position: absolute;
    top: -35px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(240, 240, 240, 0.9);
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 3px;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease, visibility 0.2s ease;
}

.mock-qna-block:hover .injected-qna-toolbar {
    opacity: 1;
    visibility: visible;
}
```

**设计要点**:
- 默认隐藏，鼠标悬停时显示
- 居中定位在问答块上方
- 半透明背景确保不完全遮挡下方内容
- 平滑的过渡动画

**包含按钮**:
- **折叠/展开按钮**: 切换问答块的折叠状态
- **复制按钮**: 复制问答内容到剪贴板

**折叠状态 CSS**:
```css
.mock-qna-block.collapsed .qna-content {
    max-height: 20px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.collapsed .collapse-button .icon {
    transform: rotate(180deg);  /* 箭头向上 */
}
```

#### 2.3 索引工具条 (Index Toolbar)

**位置**: 页面左侧固定
**定位方式**: `position: fixed`

```css
.injected-index-toolbar {
    position: fixed;
    top: 100px;
    left: calc(260px + 10px);  /* 侧边栏宽度 + 间距 */
    width: 45px;
    background: rgba(240, 240, 240, 0.9);
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 10px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    z-index: 1000;
}
```

**设计要点**:
- 固定定位，跟随页面滚动
- 位于侧边栏右侧，避免遮挡原内容
- 垂直排列，紧凑设计
- 半透明背景

**包含元素**:
- **展开全部按钮**: 展开所有折叠的问答块
- **折叠全部按钮**: 折叠所有问答块
- **索引链接**: 快速跳转到特定回答

**平滑滚动实现**:
```javascript
anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
        chatArea.scrollTo({
            top: targetElement.offsetTop - 20,
            behavior: 'smooth'
        });
    }
});
```

### 3. CSS 变量系统

```css
:root {
    --border-color: #e5e5e5;
    --background-color: #f7f7f8;
    --sidebar-bg: #202123;
    --text-color: #333;
    --text-light: #fff;
    --toolbar-bg: rgba(240, 240, 240, 0.9);
    --injected-index-width: 45px;
}
```

**设计原则**:
- 所有可配置的值使用变量
- 便于后续调整和主题定制
- 半透明背景值使用 `rgba()` 确保视觉效果

### 4. 样式隔离策略

**防止冲突的方法**:

1. **类名前缀**: 所有注入元素使用 `injected-` 前缀
2. **高 z-index**: 确保注入元素在原页面元素之上
3. **固定/绝对定位**: 避免破坏原页面流式布局
4. **边距预留**: 为索引工具条预留左侧空间

```css
.mock-chat-area {
    padding: 20px 20px 20px calc(var(--injected-index-width) + 10px);
}
```

---

## 🔗 成果应用关联

### 当前实现状态

| 注入元素 | 研究状态 | 实现状态 | 代码位置 |
|----------|----------|----------|----------|
| Sync Button | ✅ 完成 | ✅ 已实现 | page-controller.js:55-64 |
| Q&A Toolbar | ✅ 完成 | ⏳ TODO | page-controller.js:66 |
| Index Toolbar | ✅ 完成 | ⏳ TODO | page-controller.js:66 |

### 已应用内容

#### Sync Button 实现

**研究原型**:
```html
<button class="injected-sync-button">Start Sync</button>
```

**实际代码** (page-controller.js:55-64):
```javascript
this.injectUI = function() {
    const syncButton = this.util.toHtml({
        tag: 'button',
        '@id': 'multi-ai-sync-btn',
        '@style': {
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: 9999
        },
        text: this.i18n.getText('sync_chat_button_label')
    });

    syncButton.addEventListener('click', this.handleSyncButtonClick.bind(this));
    document.body.appendChild(syncButton);
};
```

**关键差异**:
- 使用 `util.toHtml()` 而非字符串拼接
- 内联样式使用对象语法
- 支持国际化 (`i18n.getText()`)
- 唯一 ID 替代类名

### 待应用内容

#### Q&A Toolbar

**研究原型交互**:
```javascript
// 折叠功能
collapseButton.addEventListener('click', () => {
    qnaBlock.classList.toggle('collapsed');
});

// 复制功能
copyButton.addEventListener('click', () => {
    const textToCopy = qnaContent.textContent || '';
    navigator.clipboard.writeText(textToCopy);
});
```

**待实现功能**:
1. 在 Driver 检测到新问答块时注入工具条
2. 实现 `setAnswerStatus(index, collapsed)` 方法
3. 与主窗口同步折叠状态

#### Index Toolbar

**研究原型交互**:
```javascript
// 平滑滚动
anchor.addEventListener('click', function (e) {
    e.preventDefault();
    chatArea.scrollTo({
        top: targetElement.offsetTop - 20,
        behavior: 'smooth'
    });
});

// 全部展开/折叠
expandAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.mock-qna-block').forEach(block => {
        block.classList.remove('collapsed');
    });
});
```

**待实现功能**:
1. 动态生成索引链接（基于问答块数量）
2. 实现平滑滚动到指定元素
3. 实现全部展开/折叠功能

---

## 📊 技术实现细节

### 1. 页面适配策略

不同的 AI 网站有不同的布局，需要动态计算位置：

```javascript
// 检测侧边栏
const sidebar = document.querySelector('.sidebar') ||
                document.querySelector('.history-panel');

// 计算索引工具条位置
const sidebarWidth = sidebar ? sidebar.offsetWidth : 0;
const indexToolbarLeft = sidebarWidth + 10;
```

### 2. 元素注入时机

```javascript
this.init = async function() {
    // 1. 等待页面加载完成
    await this.driver.init();

    // 2. 注入基础 UI (Sync Button)
    this.injectUI();

    // 3. 等待问答内容加载
    this.driver.startMonitoring();

    // 4. 动态注入工具条和索引
    this.injectEnhancements();
};
```

### 3. 事件处理流程

```
用户交互
    ↓
注入元素的事件监听器
    ↓
PageController 处理
    ↓
调用 Driver 方法
    ↓
Driver 操作原生 DOM
    ↓
通过 MessageClient 通知主窗口
```

### 4. 样式注入方法

**方法 1: 内联样式** (当前使用)
```javascript
'@style': { position: 'fixed', top: '10px', right: '10px' }
```

**方法 2: CSS 类** (推荐)
```javascript
// 1. 创建样式表
const styleSheet = document.createElement('style');
styleSheet.textContent = `.injected-sync-button { ... }`;
document.head.appendChild(styleSheet);

// 2. 使用类名
button.className = 'injected-sync-button';
```

**方法 3: Shadow DOM** (最佳隔离)
```javascript
const shadowRoot = element.attachShadow({ mode: 'open' });
shadowRoot.innerHTML = `
    <style>
        /* 样式完全隔离 */
    </style>
    <div class="toolbar">...</div>
`;
```

---

## 🎨 设计模式总结

### 注入位置选择表

| UI 元素 | 推荐定位方式 | 原因 | 适用场景 |
|----------|-------------|------|----------|
| Sync Button | `position: fixed` | 始终可见，不随页面滚动 | 页面级操作 |
| Q&A Toolbar | `position: absolute` | 相对于父元素定位 | 内容增强 |
| Index Toolbar | `position: fixed` | 跟随滚动，长期可见 | 导航工具 |

### z-index 层级策略

```
层级 10000+:     Alert/Modal
层级 9999:       Sync Button (最高优先级)
层级 1000-5000:  Index Toolbar
层级 100-999:    Q&A Toolbar
层级 0-99:       原生页面元素
```

### 视觉设计原则

1. **明显的区分度**: 使用不同的颜色、圆角、阴影
2. **半透明背景**: `rgba()` 确保不完全遮挡下方内容
3. **平滑过渡**: 所有交互都有过渡动画
4. **响应式设计**: 适应不同屏幕尺寸

---

## 🧪 研究验证方式

### 原型页面验证

**文件**: `research/page-controller.html`

**验证内容**:
- 模拟真实 AI 页面的布局
- 验证三种注入元素的位置和样式
- 测试交互功能（折叠、复制、滚动）

**运行方式**:
```bash
# 直接在浏览器中打开
open research/page-controller.html
```

**测试场景**:

1. **Sync Button 测试**:
   - 检查按钮是否始终在右上角
   - 确认点击时响应
   - 验证不被页面滚动影响

2. **Q&A Toolbar 测试**:
   - 鼠标悬停在问答块上
   - 检查工具条是否平滑显示
   - 点击折叠按钮，验证内容折叠
   - 点击复制按钮，验证剪贴板功能

3. **Index Toolbar 测试**:
   - 检查是否固定在左侧
   - 点击索引链接，验证平滑滚动
   - 点击全部展开/折叠，验证批量操作

---

## 📝 实现指南

### 添加新的注入元素

1. **在研究原型中验证**:
   ```html
   <!-- 在 page-controller.html 中添加 -->
   <div class="injected-my-element">...</div>
   ```

2. **定义 CSS 样式**:
   ```css
   .injected-my-element {
       /* 使用 injected- 前缀 */
       position: fixed; /* 或 absolute */
       z-index: 1000;
   }
   ```

3. **实现交互逻辑**:
   ```javascript
   myElement.addEventListener('click', (e) => {
       // 处理交互
   });
   ```

4. **迁移到正式代码**:
   ```javascript
   // 在 page-controller.js 中
   const element = this.util.toHtml({
       tag: 'div',
       '@class': 'injected-my-element',
       // ...
   });
   document.body.appendChild(element);
   ```

### 处理样式冲突

**问题**: 注入样式被原页面覆盖

**解决方案**:
1. 使用 `!important` (谨慎使用)
2. 提高选择器特异性
3. 使用内联样式
4. 使用 Shadow DOM

**示例**:
```javascript
// 不推荐：容易被覆盖
element.style.color = 'blue';

// 推荐：内联样式，优先级高
'@style': { color: 'blue !important' }

// 最佳：Shadow DOM 完全隔离
```

---

## 🔧 后续优化方向

1. **Shadow DOM 隔离**: 完全隔离注入元素的样式
2. **动态位置计算**: 自动适应不同页面布局
3. **主题适配**: 根据原页面主题调整注入元素样式
4. **性能优化**: 减少 DOM 操作，使用事件委托
5. **可配置性**: 允许用户自定义注入元素的位置和样式

---

## 📚 相关文档

- `research/chat-area.research.md` - ChatArea 研究成果
- `research/main-window.research.md` - MainWindow 研究成果
- `design/architect.md` - 总体架构设计
- `CLAUDE.md` - 项目开发指南
