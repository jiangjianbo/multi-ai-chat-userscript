# MainWindow 研究成果说明文档

## 📋 研究概述

本研究旨在设计和验证主窗口（MainWindow）的整体布局、多 ChatArea 容器管理、网格布局切换系统以及固定优先级排序逻辑。研究成果已完全应用到正式代码中。

**研究文件**:
- `main-window.html` - 独立可运行的主窗口原型页面
- `main-window.research.js` - 研究成果验证脚本

**应用目标**:
- `src/main-window-controller.js` - 主窗口控制器实现
- `src/sync-chat-window.js` - 主窗口 HTML/CSS 生成

---

## 🎯 研究目标

1. **整体布局设计**: 设计三段式主窗口结构（标题栏 / 内容区 / 输入区）
2. **网格布局系统**: 实现 1/2/4/6 面板的响应式网格切换
3. **固定优先级排序**: 研究固定面板优先显示的排序逻辑
4. **全局输入系统**: 设计统一的提示词输入和发送机制
5. **设置菜单**: 研究全局参数设置（Web Access、Long Thought）

---

## 🏗️ 核心研究成果

### 1. 整体布局结构

主窗口采用垂直三段式布局：

```
┌─────────────────────────────────────────────────────┐
│              Title Bar (标题栏)                      │  固定高度
│  [Logo] [名称] [语言] [布局切换] [关闭]             │
├─────────────────────────────────────────────────────┤
│              Content Area (内容区)                   │  弹性高度
│  ┌─────────┬─────────┬─────────┐                   │
│  │ ChatArea│ ChatArea│ ChatArea│  网格布局
│  │   1     │   2     │   3     │  (1/2/4/6)
│  └─────────┴─────────┴─────────┘                   │
├─────────────────────────────────────────────────────┤
│            Prompt Area (输入区)                     │  固定高度
│  [设置] [自动增长输入框] [发送]                     │
└─────────────────────────────────────────────────────┘
```

**CSS 实现关键**:
```css
.main-window {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.content-area {
    flex-grow: 1;
    display: grid;
    gap: 10px;
    overflow: auto;
}
```

### 2. 网格布局系统

**四种布局模式**:

| 布局 | 网格定义 | 最大面板数 | 适用场景 |
|------|----------|------------|----------|
| **1** | `grid-template-columns: 1fr` | 1 | 单一 AI 深度对话 |
| **2** | `grid-template-columns: 1fr 1fr` | 2 | 两两对比 |
| **4** | `grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr` | 4 | 四方对比 |
| **6** | `grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr` | 6 | 全面对比 |

**CSS 实现**:
```css
.content-area[data-layout="1"] { grid-template-columns: 1fr; }
.content-area[data-layout="2"] { grid-template-columns: 1fr 1fr; }
.content-area[data-layout="4"] {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
}
.content-area[data-layout="6"] {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
}
```

**布局切换逻辑**:
```javascript
this.setLayout = function(layout) {
    // 标准化布局值
    if (layout > 4) layout = '6';
    else if (layout > 2) layout = '4';
    else if (layout > 1) layout = '2';
    else layout = '1';

    // 更新 data-layout 属性，触发 CSS 网格变化
    this.chatAreaContainer.dataset.layout = layout;

    // 更新按钮状态
    this.layoutSwitcher.querySelector('.active').classList.remove('active');
    this.layoutSwitcher.querySelector(`[data-layout="${layout}"]`).classList.add('active');

    // 触发重新布局
    this.updateLayout();
};
```

### 3. 固定优先级排序逻辑 ⭐

**核心创新**: 固定的面板始终优先显示，不受添加顺序影响。

**排序算法**:
```javascript
this.updateLayout = function() {
    const layout = parseInt(this.chatAreaContainer.dataset.layout, 10);
    const allAreas = Array.from(this.chatAreas.values());

    // 1. 分离固定和非固定面板
    const pinned = allAreas.filter(area => area.isPinned());
    const unpinned = allAreas.filter(area => !area.isPinned());

    // 2. 固定面板优先，非固定面板按添加顺序
    const displayOrder = [...pinned, ...unpinned];

    // 3. 先隐藏所有面板
    allAreas.forEach(area => {
        if (area.container) area.container.style.display = 'none';
    });

    // 4. 根据布局数量显示前 N 个面板
    for (let i = 0; i < Math.min(layout, displayOrder.length); i++) {
        if (displayOrder[i].container) {
            displayOrder[i].container.style.display = 'flex';
        }
    }
};
```

**示例场景**:

```
场景：6 个面板，布局 = 4
面板：[AI1, AI2, AI3*, AI4, AI5*, AI6] (* 表示固定)

排序后：[AI3*, AI5*, AI1, AI2, AI4, AI6]
显示：AI3*, AI5*, AI1, AI2  (前 4 个)
隐藏：AI4, AI6
```

**可视化演示**:

| 添加顺序 | 初始状态 | AI3 固定后 | AI5 固定后 | 切换到 2 面板 |
|----------|----------|------------|------------|---------------|
| 面板 1 | AI1 | AI3* | AI3* | AI3* |
| 面板 2 | AI2 | AI5* | AI5* | AI5* |
| 面板 3 | AI3 | AI1 | AI1 | (隐藏) |
| 面板 4 | AI4 | AI2 | AI2 | (隐藏) |
| 面板 5 | AI5 | AI4 | AI4 | (隐藏) |
| 面板 6 | AI6 | AI6 | AI6 | (隐藏) |

### 4. 全局输入系统

**自动增长 Textarea**:

使用 CSS Grid + 伪元素技巧实现无 JS 计算的自动增长：

```css
.prompt-input-wrapper {
    display: grid;
}
.prompt-input-wrapper::after,
.prompt-input-wrapper textarea {
    grid-area: 1 / 1 / 2 / 2;  /* 重叠在同一网格单元 */
    width: 100%;
    min-height: 20px;
    max-height: 200px;
    /* 其他样式完全相同 */
}
.prompt-input-wrapper::after {
    content: attr(data-replicated-value) " ";
    white-space: pre-wrap;
    visibility: hidden;  /* 不可见但占位 */
}
```

**工作原理**:
1. `::after` 伪元素和 `textarea` 重叠在同一个网格单元
2. `::after` 的内容通过 `data-replicated-value` 属性同步
3. `::after` 自动增长撑开容器
4. `textarea` 跟随容器自动调整高度

**JS 同步**:
```javascript
this.promptTextarea.addEventListener('input', () => {
    this.promptWrapper.dataset.replicatedValue = this.promptTextarea.value;
});
```

### 5. 设置菜单

**位置**: 输入区左侧，点击向上弹出

```css
.settings-menu {
    display: none;
    position: absolute;
    bottom: calc(100% + 5px);  /* 上方 5px */
    left: 15px;
}
```

**全局参数同步**:
```javascript
this.settingsMenu.querySelector('#web-access').addEventListener('change', (e) => {
    this.eventHandlers.onEvtAllWebAccessChanged(e.target.checked);
    // 会通知所有 ChatArea 更新其 Web Access 状态
});
```

---

## 🔗 成果应用关联

### 1. → src/main-window-controller.js

**直接应用内容**:

| 研究内容 | 应用方式 | 代码位置 |
|----------|----------|----------|
| 整体布局结构 | HTML 结构参考 | main-window-controller.js:114-125 |
| 网格布局系统 | `setLayout()` 方法 | main-window-controller.js:234-253 |
| 固定优先级排序 | `updateLayout()` 方法 | main-window-controller.js:261-281 |
| 布局切换器 | 事件监听器 | main-window-controller.js:132-136 |
| 设置菜单 | 事件监听器 | main-window-controller.js:173-179 |
| 自动增长输入 | data 属性同步 | main-window-controller.js:196-198 |
| 语言切换 | `switchLanguage()` 方法 | main-window-controller.js:74-96 |

**关键扩展**:
- 新增 ChatArea 容器管理（`chatAreas` Map）
- 新增提供商选择互斥逻辑（`selectedProviders` Map）
- 新增消息通信集成（`MessageClient`）
- 新增国际化支持（`i18n`）

### 2. → src/sync-chat-window.js

**影响内容**:

| 研究内容 | 应用方式 | 代码位置 |
|----------|----------|----------|
| 主窗口 CSS | 完整嵌入到 `_addStyles()` | sync-chat-window.js:29-125 |
| HTML 结构 | `createWindow()` 的模板字符串 | sync-chat-window.js:239-294 |
| CSS 变量 | `:root` 定义 | sync-chat-window.js:34-48 |

**关键差异**:
- 研究原型使用 `.chat-area-container` → 实际代码中用于承载 `ChatArea` 实例
- 新增 ChatArea 相关 CSS 样式（从 chat-area 研究合并）
- 新增 `data-lang-key` 属性支持国际化

### 3. DOM 结构对应关系

**研究原型 (main-window.html)**:
```html
<div class="chat-area-container" data-pinned="false">
    AI 1 <span class="pin-icon">📌</span>
</div>
```

**实际实现 (main-window-controller.js)**:
```javascript
// 创建容器
const container = this.util.toHtml({ tag: 'div', '@class': 'chat-area-container' });
this.chatAreaContainer.appendChild(container);

// 创建 ChatArea 实例并注入到容器
const chatArea = new ChatArea(this, data.id, data.url, container, this.i18n);
chatArea.init(data);
```

**最终 DOM 结构**:
```html
<div class="chat-area-container">
    <div class="chat-area-instance">
        <!-- ChatArea 的完整内容 -->
    </div>
</div>
```

---

## 🧪 研究验证方式

### 1. 原型页面验证

**文件**: `research/main-window.html`

**验证内容**:
- 直接在浏览器中打开查看效果
- 包含 6 个模拟 ChatArea（其中 2 个固定）
- 验证布局切换和固定优先级逻辑

**运行方式**:
```bash
# 直接在浏览器中打开
open research/main-window.html
```

**交互测试**:
1. 点击布局按钮（1/2/4/6）查看网格变化
2. 点击任意 "AI X" 面板切换固定状态
3. 观察固定面板是否优先显示
4. 点击语言切换器查看下拉菜单
5. 点击设置按钮查看参数菜单

### 2. 集成验证

**文件**: `research/main-window.research.js`

**验证内容**:
- 使用 JS 动态渲染 HTML
- 验证样式注入是否正确
- 测试事件监听器绑定

**运行方式**:
```bash
# 构建研究代码
npm run research:build

# 在浏览器中打开生成的 research/dist/main-window.html
```

---

## 📊 技术实现细节

### 1. 布局数据流

```
用户点击布局按钮
    ↓
layoutSwitcher click event
    ↓
setLayout(layout)
    ↓
chatAreaContainer.dataset.layout = layout
    ↓
CSS Grid 响应 data-layout 属性变化
    ↓
网格布局自动调整
    ↓
updateLayout()
    ↓
根据固定状态排序并显示面板
```

### 2. 固定状态变化流程

```
用户点击 ChatArea 固定按钮
    ↓
ChatArea.setPin(!isPinned)
    ↓
mainController.updateLayout()
    ↓
重新排序：[固定...] + [非固定...]
    ↓
显示前 N 个面板（N = 当前布局数）
```

### 3. ChatArea 容器显示控制

**为什么使用 `display: flex` 而不是 `display: block`？**

```css
.chat-area-container {
    display: flex;
    justify-content: center;
    align-items: center;
}
```

**原因**:
1. ChatArea 内部使用 flex 布局
2. `display: flex` 确保容器能正确撑满网格单元
3. 配合 `flex-direction: column` 确保 ChatArea 垂直布局正常

### 4. 新增 ChatArea 按钮状态管理

```javascript
this.updateNewChatButtonState = function() {
    const layout = parseInt(this.chatAreaContainer.dataset.layout, 10);
    const numAreas = this.chatAreas.size;
    this.newChatButton.disabled = numAreas >= layout;
};
```

**逻辑**:
- 布局 = 1 → 最多 1 个面板 → 达到后禁用按钮
- 布局 = 2 → 最多 2 个面板 → 达到后禁用按钮
- 布局 = 4 → 最多 4 个面板 → 达到后禁用按钮
- 布局 = 6 → 最多 6 个面板 → 达到后禁用按钮

---

## 🎨 样式设计规范

### 颜色系统

| 用途 | 颜色值 | CSS 变量 |
|------|--------|----------|
| 边框 | `#ddd` | `--border-color` |
| 背景 | `#f4f4f4` | `--background-color` |
| 标题栏 | `#fff` | `--title-bg` |
| 按钮 | `#e9e9e9` | `--button-bg` |
| 按钮（悬停） | `#dcdcdc` | `--button-hover-bg` |
| 按钮（激活） | `#007bff` | `--button-active-bg` |
| 固定图标 | `#ffc107` | `--pin-color` |

### 间距系统

| 元素 | 间距 |
|------|------|
| 标题栏内边距 | `8px 15px` |
| 内容区内边距 | `10px` |
| 网格间距 | `10px` |
| 输入区内边距 | `10px 15px` |
| 元素间距 | `15px` |

### 尺寸系统

| 元素 | 尺寸 |
|------|------|
| 布局按钮 | `padding: 6px 10px` |
| 圆形按钮 | `36px × 36px` |
| 切换开关 | `40px × 20px` |
| Textarea 最大高度 | `200px` |

---

## 🔄 与 ChatArea 研究的协作

### CSS 样式合并

`sync-chat-window.js` 中的 `_addStyles()` 函数合并了两套研究：

1. **MainWindow 主窗口样式** (第 29-125 行)
2. **ChatArea 面板样式** (第 136-226 行)

**共享的 CSS 变量**:
```css
:root {
    --border-color: #ddd;      /* 两套研究共享 */
    --background-color: #f4f4f4;  /* 主窗口定义 */
    --index-width: 45px;        /* ChatArea 定义 */
}
```

### DOM 层级关系

```
.main-window
    └── .content-area (Grid 容器)
        └── .chat-area-container (Grid 单元)
            └── .chat-area-instance (ChatArea 根元素)
                ├── .chat-area-title
                ├── .chat-area-main
                │   ├── .chat-area-index
                │   └── .chat-area-conversation
                └── .chat-area-input
```

### 固定状态传递

```javascript
// ChatArea 内部
this.setPin = function(isPinned) {
    this.pinned = isPinned;
    this.updatePinState();
    // 通知主窗口控制器
    if (this.mainController && this.mainController.updateLayout) {
        this.mainController.updateLayout();
    }
};
```

---

## 🎯 布局算法详解

### 算法伪代码

```
FUNCTION updateLayout():
    layout = GET current layout number (1/2/4/6)
    allAreas = GET all ChatArea instances

    // 步骤 1: 分类
    pinned = FILTER allAreas WHERE isPinned() = true
    unpinned = FILTER allAreas WHERE isPinned() = false

    // 步骤 2: 排序（固定优先）
    displayOrder = CONCAT(pinned, unpinned)

    // 步骤 3: 隐藏所有
    FOR each area IN allAreas:
        area.container.style.display = 'none'

    // 步骤 4: 显示前 N 个
    visibleCount = MIN(layout, LENGTH(displayOrder))
    FOR i FROM 0 TO visibleCount - 1:
        displayOrder[i].container.style.display = 'flex'
```

### 时间复杂度

- 分类: O(n)
- 排序: O(1)（简单拼接）
- 隐藏: O(n)
- 显示: O(n)
- **总计: O(n)** - n 为 ChatArea 数量

### 空间复杂度

- pinned 数组: O(n)
- unpinned 数组: O(n)
- displayOrder 数组: O(n)
- **总计: O(n)**

---

## 🔧 后续优化方向

1. **拖拽排序**: 允许用户手动调整面板顺序
2. **自定义布局**: 支持非对称布局（如 1+2 模式）
3. **布局预设**: 保存常用的布局配置
4. **动画过渡**: 添加面板切换的平滑动画
5. **响应式优化**: 针对小屏幕设备的适配

---

## 📝 使用指南

### 研究新布局时

1. 修改 `research/main-window.html` 快速验证布局效果
2. 确认效果后，同步 CSS 到 `src/sync-chat-window.js` 的 `_addStyles()`
3. 同步 HTML 结构到 `src/sync-chat-window.js` 的 `createWindow()`
4. 同步交互逻辑到 `src/main-window-controller.js`
5. 更新本文档记录变更

### 调试布局问题时

1. 先在 `research/main-window.html` 中验证基础布局
2. 检查 `data-layout` 属性是否正确设置
3. 使用浏览器开发者工具检查 Grid 布局计算
4. 确认 ChatArea 的 `container.style.display` 是否正确

---

## 📚 相关文档

- `research/chat-area.research.md` - ChatArea 研究成果文档
- `design/architect.md` - 总体架构设计
- `design/main-window.md` - MainWindow 模块详细设计
- `CLAUDE.md` - 项目开发指南
