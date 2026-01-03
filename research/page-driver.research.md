# PageDriver 研究成果说明文档

## 📋 研究概述

**PageDriver Research Script** 是一个 Tampermonkey 脚本，用于在实际 AI 聊天网站上测试和验证 PageDriver 的 CSS 选择器。它通过可视化高亮的方式，帮助开发者确认 Driver 能否正确识别页面元素。

**研究文件**:
- `page-driver.research.js` - Tampermonkey 测试脚本

**应用目标**:
- `src/page-driver.js` - PageDriver 基类和具体驱动实现
- `src/driver-factory.js` - 驱动工厂，根据域名创建对应 Driver

---

## 🎯 研究目标

1. **选择器验证**: 验证不同 AI 网站的 CSS 选择器是否正确
2. **可视化调试**: 通过红色边框和标签高亮显示识别到的元素
3. **多网站支持**: 支持 Kimi、Gemini、ChatGPT 等多个 AI 平台
4. **快速迭代**: 无需修改源码即可测试新的选择器
5. **问题定位**: 快速定位选择器错误（未找到元素、选择错误元素等）

---

## 🏗️ 核心工作机制

### 1. 脚本架构

```
Tampermonkey 加载
    ↓
等待页面加载完成 (5秒延迟)
    ↓
获取当前域名
    ↓
DriverFactory.createDriver(hostname)
    ↓
根据域名返回对应 Driver 实例
    ↓
调用 Driver 的 element*() 方法
    ↓
高亮显示识别到的元素
```

### 2. 高亮功能实现

**`highlightElements()` 函数**:

```javascript
function highlightElements(elements, label) {
    const applyStyle = (el, index) => {
        if (el) {
            // 1. 添加红色边框
            el.style.border = '2px solid red';

            // 2. 设置相对定位（用于放置标签）
            el.style.position = 'relative';

            // 3. 创建标签元素
            const labelDiv = document.createElement('div');
            labelDiv.innerText = `${label} ${index > 0 ? index + 1 : ''}`;
            labelDiv.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                background-color: red;
                color: white;
                padding: 2px 5px;
                font-size: 12px;
                z-index: 9999;
            `;

            el.appendChild(labelDiv);
        }
    };

    // 支持单个元素或元素列表
    if (elements instanceof NodeList || Array.isArray(elements)) {
        Array.from(elements).forEach((el, i) => applyStyle(el, i));
    } else {
        applyStyle(elements, 0);
    }
}
```

**视觉效果**:
```
┌──────────────────────────────────────┐
│ [Chat Title 1]                       │ ← 红色边框 + 红色标签
│                                      │
│ ┌────────────────────────────────┐  │
│ │ [Prompt Input]                 │  │ ← 红色边框 + 红色标签
│ └────────────────────────────────┘  │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ [Question 1]                   │  │
│ │ [Question 2]                   │  │ ← 多个元素带编号
│ │ [Question 3]                   │  │
│ └────────────────────────────────┘  │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ [Answer 1]                     │  │
│ │ [Answer 2]                     │  │
│ └────────────────────────────────┘  │
│                                      │
│                    [Send Button]     │ ← 红色边框 + 红色标签
└──────────────────────────────────────┘
```

---

## 🔗 PageDriver 架构

### 1. 类层次结构

```
GenericPageDriver (抽象基类)
    ├── KimiPageDriver
    ├── GeminiPageDriver
    ├── ChatGPTPageDriver
    └── ... (更多驱动)
```

### 2. GenericPageDriver 核心方法

| 方法分类 | 方法名 | 返回值 | 说明 |
|----------|--------|--------|------|
| **基础元素** | `elementPromptInput()` | HTMLElement | 输入框元素 |
| | `elementSendButton()` | HTMLElement | 发送按钮 |
| | `elementConversationArea()` | HTMLElement | 对话区域 |
| | `elementChatTitle()` | HTMLElement | 会话标题 |
| **列表元素** | `elementQuestions()` | NodeList | 所有问题 |
| | `elementAnswers()` | NodeList | 所有回答 |
| | `elementHistoryItems()` | NodeList | 历史记录项 |
| **索引元素** | `elementQuestion(index)` | HTMLElement | 指定问题 |
| | `elementAnswer(index)` | HTMLElement | 指定回答 |
| **选项元素** | `elementWebAccessOption()` | HTMLElement | 联网开关 |
| | `elementLongThoughtOption()` | HTMLElement | 长思考开关 |
| | `elementModelVersionList()` | NodeList | 模型列表 |
| | `elementCurrentModelVersion()` | HTMLElement | 当前模型 |
| | `elementNewSessionButton()` | HTMLElement | 新会话按钮 |

### 3. Selectors 对象结构

```javascript
this.selectors = {
    // 核心交互元素
    promptInput: 'textarea',           // 输入框选择器
    sendButton: 'button[type="submit"]', // 发送按钮
    conversationArea: '#conversation', // 对话区域

    // 内容元素
    questions: '.question',            // 问题选择器
    answers: '.answer',                // 回答选择器
    chatTitle: 'h1',                   // 标题选择器

    // 历史记录
    historyItems: '.history-item',     // 历史项选择器
    historyArea: '.history-area',      // 历史区域

    // 选项按钮
    newSessionButton: 'button.new-session',
    webAccessOption: 'input#web-access',
    longThoughtOption: 'input#long-thought',
    modelVersionList: 'select.model-version',
    currentModelVersion: 'span.current-model'
};
```

---

## 🎯 具体驱动实现：KimiPageDriver

### 1. 选择器覆盖

```javascript
function KimiPageDriver() {
    GenericPageDriver.call(this);

    const kimiSelectors = {
        // Kimi 特定的选择器
        promptInput: 'div.chat-action > div.chat-editor > div.chat-input div.chat-input-editor',
        sendButton: 'div.chat-action > div.chat-editor > div.chat-editor-action div.send-button-container > div.send-button',
        questions: 'div.chat-content-item.chat-content-item-user div.segment-content div.segment-content-box',
        answers: 'div.chat-content-item.chat-content-item-assistant div.segment-content div.segment-content-box',
        conversationArea: '#app div.main div.layout-content-main div.chat-content-container',
        chatTitle: '#app div.main div.layout-header header.chat-header-content h2',
        historyItems: '.sidebar div.history-part ul li',
        newSessionButton: '#app aside div.sidebar-nav a.new-chat-btn',
        // ... 更多选择器
    };

    // 合并到基类选择器
    this.selectors = Object.assign({}, this.selectors, kimiSelectors);

    this.providerName = 'Kimi';
}
```

### 2. 特殊处理：选项缓存

Kimi 的选项（联网、长思考）在弹出窗口中，需要特殊处理：

```javascript
this.init = async function() {
    // 点击选项按钮，获取弹出窗口中的元素值
    if (this.optionButton) {
        await this.util.clickAndGet(this.optionButton, () => {
            this.cachedWebAccess = this.util.getBoolean(
                this.util.$(this.selectors.webAccessOption)
            );
            this.cachedLongThought = this.util.getBoolean(
                this.util.$(this.selectors.longThoughtOption)
            );
        });
    }

    // 模型版本列表也需要类似处理
    if (this.modelVersionButton) {
        await this.util.clickAndGet(this.modelVersionButton, () => {
            this.cachedVersions = Array.from(
                this.util.$$(this.selectors.modelVersionList),
                node => node.textContent
            );
        });
    }
};
```

**`util.clickAndGet()` 方法**:
```javascript
this.clickAndGet = async function(clickElement, callback) {
    clickElement.click();          // 1. 点击按钮打开弹出窗口
    await new Promise(resolve => setTimeout(resolve, 200)); // 2. 等待动画
    const result = callback();     // 3. 执行回调获取元素
    clickElement.click();          // 4. 再次点击关闭弹出窗口
    return result;
};
```

---

## 🔧 DriverFactory 工厂模式

### 1. URL 到 Driver 的映射

```javascript
const urlMap = {
    'kimi.ai': { name: 'Kimi', url: 'https://www.kimi.com' },
    'www.kimi.com': { name: 'Kimi', url: 'https://www.kimi.com' },
    'gemini.google.com': { name: 'Gemini', url: 'https://gemini.google.com/app' },
    'chat.openai.com': { name: 'ChatGPT', url: 'https://chat.openai.com' },
};

const driverMap = {
    'Kimi': KimiPageDriver,
    'Gemini': GeminiPageDriver,
    'ChatGPT': ChatGPTPageDriver,
};
```

### 2. 创建 Driver 实例

```javascript
this.createDriver = function(hostname) {
    const nameUrl = urlMap[hostname];
    if (nameUrl) {
        const Driver = driverMap[nameUrl.name];
        if (Driver) {
            return new Driver();  // 创建具体驱动实例
        }
    }
    // 未找到对应驱动，使用通用驱动
    console.warn(`No specific driver found for ${hostname}. Using GenericPageDriver.`);
    return new GenericPageDriver();
}
```

---

## 📊 测试验证流程

### 1. 安装 Tampermonkey 脚本

1. 打开 Tampermonkey 管理面板
2. 创建新脚本
3. 复制 `page-driver.research.js` 内容
4. 保存脚本

### 2. 配置脚本匹配规则

在脚本头部添加：

```javascript
// @match         https://www.kimi.com/*
// @match         https://gemini.google.com/*
// @match         https://chat.openai.com/*
// @grant         none
// @run-at       document-idle
```

### 3. 访问目标网站

访问任一支持的 AI 网站（如 Kimi），等待 5 秒后：
- 查看控制台日志
- 观察页面上的红色高亮
- 确认元素是否被正确识别

### 4. 控制台输出示例

```
[Research] PageDriver script loaded.
[Research] Window loaded. Initializing driver...
[Research] Driver created for www.kimi.com: KimiPageDriver { ... }
[Research] Found 3 history items.
[Research] Found 5 questions.
[Research] Found 5 answers.
```

### 5. 问题诊断

| 现象 | 可能原因 | 解决方法 |
|------|----------|----------|
| 无红色高亮 | 页面未加载完成 | 增加延迟时间 |
| 只有部分高亮 | 选择器不正确 | 使用浏览器开发者工具检查选择器 |
| 高亮位置错误 | 选择器匹配到错误元素 | 细化选择器路径 |
| 控制台警告 | Driver 未初始化 | 确认域名在 urlMap 中 |

---

## 🛠️ 扩展指南

### 添加新的 AI 网站支持

#### 步骤 1: 确定目标网站的 DOM 结构

使用浏览器开发者工具检查关键元素：

```html
<!-- 示例：Claude.ai 的输入框 -->
<div class="cl-audio-input">
    <textarea id="prompt-input" rows="1"></textarea>
</div>
```

#### 步骤 2: 创建 ClaudePageDriver

在 `src/page-driver.js` 中添加：

```javascript
function ClaudePageDriver() {
    GenericPageDriver.call(this);

    const claudeSelectors = {
        promptInput: '#prompt-input',
        sendButton: 'button.send-button',
        questions: 'div.user-message',
        answers: 'div.assistant-message',
        conversationArea: 'div.chat-container',
        chatTitle: 'h1.chat-title',
        // ... 其他选择器
    };

    this.selectors = Object.assign({}, this.selectors, claudeSelectors);
    this.providerName = 'Claude';
}
```

#### 步骤 3: 注册到 DriverFactory

在 `src/driver-factory.js` 中添加映射：

```javascript
const urlMap = {
    // ... 现有映射
    'claude.ai': { name: 'Claude', url: 'https://claude.ai' },
};

const driverMap = {
    // ... 现有驱动
    'Claude': ClaudePageDriver,
};
```

#### 步骤 4: 导出新驱动

在 `src/page-driver.js` 底部：

```javascript
module.exports = {
    GenericPageDriver,
    KimiPageDriver,
    GeminiPageDriver,
    ChatGPTPageDriver,
    ClaudePageDriver,  // 新增
};
```

#### 步骤 5: 测试验证

1. 使用研究脚本在新网站上测试
2. 检查所有元素是否正确高亮
3. 修复选择器问题
4. 在 PageController 中集成

---

## 🎨 选择器编写技巧

### 1. 优先级原则

```
ID 选择器 > Class 选择器 > 属性选择器 > 标签选择器
```

### 2. 避免过度具体

**不推荐**:
```javascript
promptInput: 'body > div#app > div.main > div.chat-action > div.chat-editor > div.chat-input > div.chat-input-editor'
```

**推荐**:
```javascript
promptInput: 'div.chat-input-editor'
```

### 3. 使用属性选择器增强稳定性

```javascript
// 不稳定：依赖文本内容
sendButton: 'button:contains("发送")'

// 推荐：使用属性
sendButton: 'button[aria-label="发送"]'

// 更好：组合属性
sendButton: 'button[type="submit"][aria-label="发送"]'
```

### 4. 处理动态类名

```javascript
// 不稳定：类名包含随机字符
promptInput: 'div.abc123 textarea'

// 推荐：使用部分匹配或属性
promptInput: 'div[class*="chat-editor"] textarea'
promptInput: 'div[data-testid="chat-input"] textarea'
```

---

## 📝 常见选择器模式

### 输入框模式

| 模式 | 选择器 | 适用场景 |
|------|--------|----------|
| 基础 | `textarea` | 简单页面 |
| 属性 | `textarea[name="prompt"]` | 带名称属性 |
| 组合 | `div.input-wrapper > textarea` | 嵌套结构 |
| 数据属性 | `textarea[data-testid="prompt"]` | React 应用 |
| 部分匹配 | `div[class*="editor"] textarea` | 动态类名 |

### 发送按钮模式

| 模式 | 选择器 | 适用场景 |
|------|--------|----------|
| 类型 | `button[type="submit"]` | 表单提交 |
| 属性 | `button[aria-label="Send"]` | 无障碍属性 |
| 图标 | `button svg.send-icon` + 父元素 | SVG 图标 |
| 文本 | `button:contains("发送")` | 需配合父元素 |

### 问答块模式

| 模式 | 选择器 | 适用场景 |
|------|--------|----------|
| 类名 | `div.message.user` | 区分角色 |
| 数据属性 | `div[data-role="user"]` | 明确语义 |
| 组合 | `div.user-message > div.content` | 内容提取 |

---

## 🔍 调试技巧

### 1. 浏览器开发者工具

```javascript
// 在控制台中测试选择器
document.querySelector('textarea')
document.querySelectorAll('div.message')

// 检查元素属性
document.querySelector('button').attributes
```

### 2. 选择器验证函数

```javascript
function testSelector(selector) {
    const elements = document.querySelectorAll(selector);
    console.log(`Selector: ${selector}`);
    console.log(`Found: ${elements.length} elements`);
    elements.forEach((el, i) => {
        console.log(`  [${i}]:`, el);
        el.style.border = '2px solid blue';
    });
}

// 测试
testSelector('div.chat-input-editor');
```

### 3. 实时选择器测试器

```javascript
// 在控制台运行，创建测试面板
const tester = document.createElement('div');
tester.innerHTML = `
    <div style="position:fixed;top:10px;right:10px;z-index:9999;background:white;padding:10px;border:1px solid #ccc;">
        <input id="test-selector" placeholder="输入选择器" style="width:200px;">
        <button onclick="testSelector(document.getElementById('test-selector').value)">测试</button>
    </div>
`;
document.body.appendChild(tester);
```

---

## 📚 相关文档

- `research/page-controller.research.md` - PageController 研究成果
- `src/page-driver.js` - Driver 实现
- `src/driver-factory.js` - 驱动工厂
- `design/architect.md` - 总体架构设计
