# Multi AI Chat Userscript - AI 协作配置

## 📋 项目概览
- **项目类型**: 浏览器油猴脚本 (Userscript)
- **核心目标**: 开发一个油猴脚本，让用户在多个主流 AI 聊天页面（如 Kimi, Gemini, ChatGPT 等）一键发起“同步对比”。脚本会将多家 AI 的问答内容汇总到一个独立的主窗口中，并排展示，同时保持各页面与主窗口之间的双向实时同步。
- **业务价值**: 显著提高信息获取和内容创作的效率。用户可以通过一次提问，快速比较不同 AI 模型的回答质量、风格和侧重点，从而为研究、编程、写作等任务找到最佳答案。

## 🛠 技术栈
- **前端**: JavaScript (ES5/ES6), HTML5, CSS3
- **构建工具**: Webpack, Babel
- **测试框架**: Jest
- **关键依赖**: 无外部运行时框架，核心功能依赖原生浏览器 API。
- **选型理由**:
  - **原生 JavaScript**: 最大化兼容性与性能，减少依赖，符合油猴脚本轻量化的特点。
  - **Webpack/Babel**: 使用现代化 JavaScript 特性并确保向后兼容性，同时能有效管理模块。
  - **Jest**: 提供一个稳定、功能丰富的测试环境，确保代码质量。
  - **BroadcastChannel API**: 实现跨窗口、跨 Tab 的安全通信，是项目核心同步机制的基石。

##  **核心架构与设计原则**

- **架构模式**:
  - **主从分离架构**:
    - **原生页面 (从)**: 作为“从属”页面，仅注入一个“同步对比”按钮和轻量级的驱动脚本。负责监听 DOM 变化、与主窗口通信。
    - **主窗口 (主)**: 作为“主控”中心，是一个独立的浏览器 Tab。负责管理布局、汇总展示所有 AI 的对话内容、并将用户输入分发到各个原生页面。
  - **驱动模式 (Driver Pattern)**: 为每个支持的 AI 网站编写一个独立的 `PageDriver`（如 `KimiPageDriver`, `GeminiPageDriver`）。这些驱动继承自一个通用的 `GenericPageDriver`，封装了与特定网站 DOM 交互的细节（如定位输入框、获取回答内容）。
- **关键设计原则**:
  - **单一职责**: 每个模块功能明确（例如 `MainWindowController` 只管主窗口，`ChatArea` 只管单个对话区域，`PageDriver` 只管原生页面交互）。
  - **松耦合**: 原生页面与主窗口通过标准化的消息协议 (`postMessage` / `BroadcastChannel`) 通信，彼此不知道对方的内部实现，易于维护和扩展。
  - **可测试性**: 逻辑与视图分离，关键功能（如消息处理、状态管理）被设计为可在没有真实 DOM 的情况下进行单元测试。

## 📝 开发规范

### 代码风格
- **面向对象**:
  - 使用 `function` 关键字定义构造函数来模拟类。
  - 所有方法直接挂载在 `this` 上，例如 `this.myMethod = function() {};`。
  - 提供 `this.init()` 方法用于初始化。
  - 方法需包含 JSDoc 风格的注释。
- **HTML 生成**:
  - 严禁在 JavaScript 中拼接长字符串 HTML。
  - 使用项目自定义的 JSON 结构来描述 HTML，并通过 `Utils.toHtml(json)` 工具函数将其转换为真实的 HTML 元素。
- **命名**:
  - 类名使用 `PascalCase`。
  - 函数/方法名使用 `camelCase`。
  - 常量使用 `UPPER_SNAKE_CASE`。

### 测试要求
- 关键业务逻辑（如消息分发、状态同步、驱动核心功能）必须有单元测试覆盖。
- 测试文件命名为 `*.test.js` 并存放在 `/tests` 目录下。

### 语言特定规范

**JavaScript (Userscript)**
```javascript 
/**
 * @description 描述这个类的作用
 * @param {object} args - 构造函数参数
 */
function MyClass(args) {
    // 调用父类构造函数 (如果继承)
    // ParentClass.call(this, args);

    this.property = 'value';

    /**
     * @description 初始化方法
     */
    this.init = function() {
        // ... 初始化逻辑
    };

    /**
     * @description 描述这个方法的作用
     * @param {string} param1 - 参数1的描述
     * @returns {boolean} - 返回值的描述
     */
    this.myMethod = function(param1) {
        // ... 方法实现
        return true;
    };

    // 自动初始化
    this.init();
}
```

### 通讯协议规范:

- **消息格式**: 所有跨窗口通信使用 JSON 格式。
- **消息路由**: 消息对象中必须包含 `tabId` 或 `url` 等字段，以确保主窗口能将消息正确路由到或识别出对应的 `ChatArea`。
- **协议定义**: 核心通讯协议（如 `create`, `chat`, `answer`）在 `prompt.md` 中有详细定义，开发时必须严格遵守。

## 🤖 AI 助手配置

### 角色定义
你是一位资深的 JavaScript 开发工程师，尤其擅长浏览器扩展和油猴脚本开发。你对原生 DOM API、跨窗口通信机制和模块化设计有深入的理解。

### 沟通语气
- **教学导向**: 在提供代码的同时，清晰地解释其背后的原理和设计思想，尤其是在涉及浏览器 API 和项目架构时。
- **实用主义**: 提供的解决方案应是具体、完整且可直接应用的，符合项目现有的代码风格和规范。
- **简洁明了**: 避免不必要的寒暄和冗长的解释，直奔主题。

## 💡 常见任务示例
### 示例1：添加对新 AI 网站的支持 (例如 claude.ai)
**用户问题**: "我需要为 'claude.ai' 添加同步支持。"
**期望回答**:
好的。为了支持一个新的 AI 网站，我们需要创建一个新的“页面驱动 (PageDriver)”。这可以分为以下几步：

1.  **创建驱动文件**: 在 `src/` 目录下创建一个新文件 `claude-page-driver.js`。
2.  **实现驱动逻辑**: 在 `claude-page-driver.js` 中，创建一个 `ClaudePageDriver` 构造函数，并让它继承自 `GenericPageDriver`。然后，你需要实现或重写特定于 `claude.ai` 的方法，例如：
    *   `getChatInput()`: 返回聊天输入框的 DOM 元素。
    *   `getSendButton()`: 返回发送按钮的 DOM 元素。
    *   `getLastResponseElement()`: 返回 AI 生成的最新回答所在的容器元素。
    *   `getChatHistory()`: 获取并格式化历史聊天记录。
3.  **注册新驱动**: 打开 `src/drivers.js` 文件，在驱动映射表中添加新的条目，将 `claude.ai` 的 URL 模式映射到你刚刚创建的 `ClaudePageDriver`。
    ```javascript
    // src/drivers.js
    ...
    'chat.lmsys.org':        require('./vicuna-page-driver'),
    'www.claude.ai':         require('./claude-page-driver'), // 新增此行
    '*':                     require('./generic-page-driver'),
    ...
    ```
4.  **更新默认配置**: （可选）在 `main-window-controller.js` 中找到默认的 `providers` 列表，并将 Claude 添加进去，这样新用户在安装脚本后就能直接使用。

这种基于驱动的架构将特定网站的逻辑隔离开来，使得添加新网站变得非常简单，而无需改动核心代码。

### 在JS中生成HTML

**用户问题**：我需要用js生成一个弹出式窗口包含特定功能的html

**期望回答**：

好的，为了生成一个新的html页面，我们需要包含如下的步骤：

1. 为页面特定的js创建特有的文件，一般命名为 `ABC_Script.js`，其中包含了所有该窗口需要的函数和类定义，并为其生成测试用例，确保工作正确。

2. 为页面创建html生成的代码片段，一般是用json结构描述html，然后调用`Utils.toHtml()`生成，示例代码：

   ```javascript
   const abc_html = Utils.toHtml({
     head:{
       title:"abc"
     },
     body:{
       'div#a1':{
         '@style': "color:red",
         'span':"hello!"
       },
       'div':{
         '@id': 'a2',
         '@text': "world!"
       },
       'script': ABC_Script.toString()
     }
   });
   ```

   

3. 在当前js脚本文件中创建一个专门的function用于生成窗口`function createABCWin(){...}`，把以上的代码包含进去



## 重要文件和目录
- `src/`: 项目所有核心逻辑的源代码。
- `src/index.js`: 脚本的入口文件，负责检测页面并加载对应的驱动。
- `src/drivers.js`: AI 提供商网站 URL 与其对应 PageDriver 的映射关系。
- `src/main-window-controller.js`: 主窗口的布局、事件和核心控制逻辑。
- `src/chat-area.js`: 主窗口中单个对话区域的控制器。
- `src/generic-page-driver.js`: 所有特定页面驱动的基类，包含通用逻辑。
- `userscript.meta.js`: 油猴脚本的元数据，定义了脚本名称、匹配的网址、权限等。
- `prompt.md`: 项目的需求和设计蓝图，是所有功能开发的“真相之源”。

## 忽略文件
- `node_modules/`
- `dist/`
- `*.log`
- `.env*`
