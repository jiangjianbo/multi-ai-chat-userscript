# ChatArea 研究成果说明文档

## 📋 研究概述

本研究旨在设计和验证 ChatArea（单个 AI 对话面板）的 UI 布局、交互逻辑和样式系统。研究成果已完全应用到正式代码中。

**研究文件**:
- `chat-area.html` - 独立可运行的原型页面
- `chat-area.research.js` - 研究成果验证脚本

**应用目标**:
- `src/chat-area.js` - ChatArea 类实现
- `src/main-window-controller.js` - 主窗口控制器
- `src/sync-chat-window.js` - 主窗口 HTML/CSS 生成

---

## 🎯 研究目标

1. **UI 布局设计**: 设计紧凑、直观的对话面板布局
2. **交互逻辑验证**: 验证鼠标悬停输入框、下拉菜单、折叠/展开等交互
3. **样式系统**: 建立完整的 CSS 变量系统和响应式布局
4. **状态管理**: 固定/非固定面板的状态切换逻辑

---

## 🏗️ 核心研究成果

### 1. 整体布局结构

ChatArea 采用垂直三段式布局：

```
┌─────────────────────────────────────┐
│      Title Bar (标题栏)              │  固定高度
├─────────────────────────────────────┤
│      Main Area (主区域)              │  弹性高度
│  ┌───┬─────────────────────────┐   │
│  │ I │    Conversation         │   │
│  │ N │    (对话内容区)          │   │
│  │ D │                         │   │
│  │ X │                         │   │
│  └───┴─────────────────────────┘   │
├─────────────────────────────────────┤
│   Input Placeholder / Input Area    │  绝对定位
└─────────────────────────────────────┘
```

**组件说明**:

| 组件 | 功能 | 关键特性 |
|------|------|----------|
| **Title Bar** | 显示 AI 提供商、参数设置、操作按钮 | 下拉菜单、固定按钮 |
| **Index Column** | 快速跳转到特定回答 | 锚点导航、折叠/展开全部 |
| **Conversation** | 显示问答对话 | 消息气泡、滚动支持 |
| **Input System** | 悬停/固定两种输入模式 | 鼠标交互、自动增长 |

### 2. 标题栏组件

**左侧**:
- AI 提供商选择器（下拉菜单）
- 新会话按钮

**中间**:
- 展开全部按钮
- 折叠全部按钮
- 导出内容按钮

**右侧**:
- 参数设置按钮（下拉菜单：Web Access、Long Thought、Model Version）
- 分享按钮
- 固定/取消固定按钮
- 关闭按钮

**关键交互**:
```javascript
// 下拉菜单切换
toggleDropdown(event, dropdown) {
    dropdown.classList.toggle('visible');
}

// 固定状态切换（影响布局优先级）
pinButton.addEventListener('click', () => {
    this.setPin(!this.isPinned());
    // 通知主控制器更新布局
    this.mainController.updateLayout();
});
```

### 3. 输入系统交互设计

**双模式输入系统**是本研究的核心创新：

**模式 1: Input Placeholder（输入占位符）**
- 默认状态：底部中央显示 "Input" 按钮
- 鼠标悬停 → 自动展开输入框

**模式 2: Input Area（输入区域）**
- 展开状态：完整的输入框 + 发送按钮
- 鼠标离开 → 300ms 后自动收起
- 输入框聚焦 → 固定模式（docked），保持展开

**状态转换图**:
```
              [鼠标悬停 Placeholder]
                        ↓
    [Placeholder] ──→ [Input Area: visible]
                        ↓
                 [输入框聚焦] → [docked = true]
                        ↓
    [鼠标离开 + 延时 300ms]
                        ↓
              [检查是否已聚焦]
        ↗                    ↘
   [是: 保持展开]          [否: 收起为 Placeholder]
```

**实现代码**:
```javascript
// 显示输入框
this.showInput = function() {
    clearTimeout(this.hideTimeout);
    this.placeholder.classList.add('hidden');
    this.inputArea.classList.add('visible');
};

// 固定输入框（聚焦时）
this.dockInput = function() {
    this.showInput();
    this.inputArea.classList.add('docked');
    this.mainArea.style.paddingBottom = `${this.inputArea.offsetHeight}px`;
};

// 解除固定（离开时）
this.undockInput = function() {
    this.inputArea.classList.remove('docked');
    this.mainArea.style.paddingBottom = '0px';
    this.hideTimeout = setTimeout(() => {
        if (!this.inputArea.contains(document.activeElement)) {
            this.inputArea.classList.remove('visible');
            this.placeholder.classList.remove('hidden');
        }
    }, 300);
};
```

### 4. CSS 变量系统

```css
:root {
    --border-color: #ccc;
    --background-color: #f9f9f9;
    --index-width: 45px;
}
```

**设计原则**:
- 使用 CSS 变量便于主题定制
- `--index-width` 是核心布局变量，影响多处计算
- 支持嵌套在主窗口中的网格布局

### 5. 消息气泡系统

**问题气泡** (`question`):
- 背景色: `#dcf8c6`（淡绿色）
- 对齐: 右对齐 (`margin-left: auto`)

**回答气泡** (`answer`):
- 背景色: `#fff`（白色）
- 对齐: 左对齐
- 边框: `1px solid var(--border-color)`
- 支持折叠状态：`.collapsed` 类

---

## 🔗 成果应用关联

### 1. → src/chat-area.js

**直接应用内容**:

| 研究内容 | 应用方式 | 代码位置 |
|----------|----------|----------|
| HTML 结构 | `render()` 方法的模板字符串 | chat-area.js:63-148 |
| CSS 样式 | 复制到 sync-chat-window.js | sync-chat-window.js:29-226 |
| 交互逻辑 | `initEventListeners()` 方法 | chat-area.js:165-243 |
| 输入系统 | `showInput/dockInput/undockInput` | chat-area.js:303-324 |
| 下拉菜单 | `toggleDropdown/closeDropdowns` | chat-area.js:286-298 |

**关键差异**:
- 研究 HTML 使用字符串拼接 → 保留（因为复杂的 HTML 结构）
- 新增 `data-lang-key` 属性支持国际化
- 新增事件处理器系统 (`setEventHandler`)
- 新增提供商选择器逻辑（防止重复选择）

### 2. → src/main-window-controller.js

**影响内容**:

| 研究特性 | 应用方式 | 代码位置 |
|----------|----------|----------|
| ChatArea 容器创建 | 使用 `util.toHtml()` | main-window-controller.js:395 |
| 固定优先级布局 | `updateLayout()` 方法 | main-window-controller.js:261-281 |
| 提供商选择互斥 | `getUnavailableProviders()` | main-window-controller.js:476-484 |

**布局逻辑**:
```javascript
this.updateLayout = function() {
    const layout = parseInt(this.chatAreaContainer.dataset.layout, 10);
    const allAreas = Array.from(this.chatAreas.values());

    const pinned = allAreas.filter(area => area.isPinned());
    const unpinned = allAreas.filter(area => !area.isPinned());

    // 固定的面板优先显示
    const displayOrder = [...pinned, ...unpinned];

    // 根据布局数量决定显示哪些面板
    for (let i = 0; i < Math.min(layout, displayOrder.length); i++) {
        displayOrder[i].container.style.display = 'flex';
    }
};
```

### 3. → src/sync-chat-window.js

**影响内容**:

| 研究内容 | 应用方式 | 代码位置 |
|----------|----------|----------|
| ChatArea CSS | 完整嵌入到主窗口样式 | sync-chat-window.js:136-226 |
| CSS 变量定义 | 合并到主窗口 `:root` | sync-chat-window.js:34-48 |
| 响应式布局 | 支持网格嵌套 | sync-chat-window.js:91-97 |

**样式迁移**:
- 研究的 CSS 直接复制到 `sync-chat-window.js` 的 `_addStyles()` 函数
- 确保 ChatArea 在独立窗口和主窗口中表现一致

---

## 🧪 研究验证方式

### 1. 原型页面验证

**文件**: `research/chat-area.html`

**验证内容**:
- 直接在浏览器中打开查看效果
- 包含测试数据（Gemini 和 Kimi 两个实例）
- 验证所有交互逻辑

**运行方式**:
```bash
# 直接在浏览器中打开
open research/chat-area.html
```

### 2. 集成验证

**文件**: `research/chat-area.research.js`

**验证内容**:
- 使用真实的 ChatArea 类
- 验证样式注入是否正确
- 测试与主控制器的集成

**运行方式**:
```bash
# 构建研究代码
npm run research:build

# 在浏览器中打开生成的 research/dist/main-window.html
```

---

## 📊 技术实现细节

### 1. 下拉菜单关闭机制

**全局监听** (研究原型):
```javascript
document.addEventListener('click', (e) => {
    const isDropdownClick = e.target.closest('.custom-dropdown');
    const isToggleClick = e.target.closest('.model-name, .params-button');
    if (!isDropdownClick && !isToggleClick) {
        document.querySelectorAll('.custom-dropdown.visible')
            .forEach(d => d.classList.remove('visible'));
    }
});
```

**ChatArea 内部** (正式代码):
```javascript
// 主窗口控制器通知所有 ChatArea 关闭下拉菜单
this.closeAllDropdowns = function() {
    this.chatAreas.forEach(area => area.closeDropdowns());
};

document.addEventListener('click', (e) => {
    if (!e.target.closest('.model-selector') && !e.target.closest('.params-selector')) {
        this.closeAllDropdowns();
    }
});
```

### 2. 自动调整 textarea 高度

**CSS 方案** (伪元素复制):
```css
.prompt-input-wrapper {
    display: grid;
}
.prompt-input-wrapper::after,
.prompt-input-wrapper textarea {
    grid-area: 1 / 1 / 2 / 2;
    width: 100%;
    min-height: 20px;
    max-height: 200px;
}
.prompt-input-wrapper::after {
    content: attr(data-replicated-value) " ";
    white-space: pre-wrap;
    visibility: hidden;
}
```

**JS 同步**:
```javascript
this.promptTextarea.addEventListener('input', () => {
    this.promptWrapper.dataset.replicatedValue = this.promptTextarea.value;
});
```

### 3. 消息添加机制

**HTML 生成** (正式代码使用 `util.toHtml`):
```javascript
this.addMessage = function(content, type) {
    const messageJson = {
        tag: 'div',
        '@class': `message-bubble ${type}`,
        '@id': (type === 'answer' ? id : ''),
        child: [{
            tag: 'div',
            '@class': 'bubble-content',
            innerHTML: content
        }]
    };
    const messageElement = utils.toHtml(messageJson);
    this.conversationArea.appendChild(messageElement);
    this.conversationArea.scrollTop = this.conversationArea.scrollHeight;
};
```

---

## 🎨 样式设计规范

### 颜色系统

| 用途 | 颜色值 | CSS 变量 |
|------|--------|----------|
| 边框 | `#ccc` / `#ddd` | `--border-color` |
| 背景 | `#f9f9f9` / `#f4f4f4` | `--background-color` |
| 问题气泡 | `#dcf8c6` | - |
| 发送按钮 | `#007bff` | - |
| 固定图标 | `#ffc107` | `--pin-color` |

### 间距系统

| 元素 | 间距 |
|------|------|
| Title Bar padding | `8px 12px` |
| 消息间距 | `15px` |
| 消息内边距 | `10px 15px` |
| 网格间距 | `10px` |

### 圆角系统

| 元素 | 圆角 |
|------|------|
| ChatArea 容器 | `8px` |
| 消息气泡 | `15px` |
| 按钮 | `5px` |
| 切换开关 | `22px` (高度) |

---

## 🔧 后续优化方向

1. **性能优化**: 考虑虚拟滚动处理长对话
2. **可访问性**: 添加 ARIA 标签和键盘导航支持
3. **主题定制**: 扩展 CSS 变量支持暗色模式
4. **动画优化**: 使用 CSS transform 替代部分属性动画

---

## 📝 使用指南

### 研究新功能时

1. 修改 `research/chat-area.html` 快速验证 UI 效果
2. 确认效果后，同步更新到 `src/chat-area.js` 的 `render()` 方法
3. 同步 CSS 到 `src/sync-chat-window.js` 的 `_addStyles()` 函数
4. 更新本文档记录变更

### 调试布局问题时

1. 先在 `research/chat-area.html` 中验证基础布局
2. 检查主窗口的 CSS 变量是否正确继承
3. 使用浏览器开发者工具检查网格布局计算

---

## 📚 相关文档

- `design/architect.md` - 总体架构设计
- `design/chat-area.md` - ChatArea 模块详细设计
- `CLAUDE.md` - 项目开发指南
