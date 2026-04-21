# 事件与消息流设计

本文档概述了关键组件：`PageDriver`、`PageController`、`MainWindowController` 和 `ChatArea` 之间的事件和消息通信流。它详细说明了生成的事件、传输的消息、它们的结构以及订阅关系。

## 1. 组件概述

*   **`PageDriver`**：直接与原生 AI 聊天页面的 DOM 交互。根据用户操作或页面变化生成事件。
*   **`PageController`**：在原生 AI 聊天页面上运行。订阅 `PageDriver` 事件，将其转换为标准化消息，并通过 `Message` 总线发送给 `MainWindowController`。它还接收来自 `MainWindowController` 的消息，并将其转换为 `PageDriver` API 调用。
*   **`MainWindowController`**：在主用户脚本窗口中运行。订阅来自 `PageController` 实例的消息，将其转换为 `ChatArea` API 调用。它还接收来自主窗口 UI 的用户输入，并向 `PageController` 实例发送消息。
*   **`ChatArea`**：代表 `MainWindowController` UI 中的单个 AI 聊天实例。接收来自 `MainWindowController` 的 API 调用以更新其状态和显示。ChatArea是界面组件，不直接通过事件和外部沟通。

## 2. 消息总线 (`Message` 工具)

`Message` 工具充当组件间通信的中央事件总线，尤其是在不同的浏览器上下文（原生 AI 页面和主用户脚本窗口）之间。

### 消息结构

通过 `Message` 总线发送的所有消息都遵循以下结构：

```javascript
{
    type: string, // 消息类型（例如：'create', 'answer', 'chat'）
    payload: object // 与消息关联的数据
}
```

### 常用 Payload 字段

*   标识字段，`string`，用于定位特定实例。
    - `pageId`:`string`，`PageController` 实例的唯一标识符。
    - `areaId`:`string`，`ChatArea` 实例的唯一标识符。
*   `senderId`，发送方的实例唯一标识，必须字段
*   `receiverId`，接收方的实例唯一标识，广播时候为`null`。
*   `url`：`string` - 原生 AI 页面的 URL。
*   `title`：`string` - 聊天会话的标题。
*   `content`：`string` - 文本内容（例如：问题、答案）。
*   `index`：`number` - 特定问题或答案的索引。
*   `key`：`string` - 选项或参数的键。
*   `value`：`any` - 选项或参数的值。
*   `version`：`string` - 模型版本字符串。
*   `collapsed`：`boolean` - 答案的状态（折叠/展开）。

## 3. 事件与消息流

### 3.1. `PageDriver` -> `PageController` -> `MainWindowController`

`PageDriver` 生成事件（通过回调），`PageController` 订阅这些事件。然后 `PageController` 将这些事件转换为消息并发送给 `MainWindowController`。

```mermaid
flowchart LR

subgraph PageDriver
  a1["onAnswer(index, element)"]  
  a2["onChatTitle(title)"]        
  a3["onOption(key, value)"]      
  a4["onQuestion(index, element)"]
  a5["onModelVersionChange(version)"]
  a6["onNewSession()"]                    
end
subgraph PageController
	sync["handleSyncButtonClick()"] 
end
subgraph Message
  e1["answer:areaId,index,content"]  
  e2["titleChange:areaId,title"]         
  e3["optionChange:areaId,key,value"]    
  e4["question:areaId,index,content"]    
  e5["modelVersionChange:areaId,version"]
  e6["newSession:areaId"]                
  e7["create:pageId:url,title"]          
 	e8["destroy:areaId"]                  
end

subgraph MainWindowController
  m1["onMsgAnswer(data)"]            
  m2["onMsgTitleChange(data)"]       
  m3["onMsgOptionChange(data)"]      
  m4["onMsgQuestion(data)"]          
  m5["onMsgModelVersionChange(data)"]
  m6["onMsgNewSession(data)"]        
  m7["onMsgCreate(data)"]            
  m8["onMsgDestroy(data)"]   
end
subgraph MainWindowController2
  m9["addChatArea(data)"]
  m10["removeChatArea(data.id)"]
end

subgraph ChatArea
  c1["chatArea.handleAnswer(data)"]
  c2["chatArea.updateTitle(data.title)"]
  c3["chatArea.updateOption(data.key, data.value)"]
  c4["chatArea.addQuestion(data.content)"]
  c5["chatArea.updateModelVersion(data.version)"]
  c6["newSession()"]
end
a1 --> e1 --> m1 --> c1
a2 --> e2 --> m2 --> c2
a3 --> e3 --> m3 --> c3
a4 --> e4 --> m4 --> c4
a5 --> e5 --> m5 --> c5
a6 --> e6 --> m6 --> c6
sync --> e7 --> m7 --> m9
e8 --> m8 --> m10
```

### 3.2. `MainWindowController` -> `PageController`

`MainWindowController` 接收用户输入或内部事件，并向特定的 `PageController` 实例发送消息。然后 `PageController` 将这些消息转换为 `PageDriver` API 调用。

```mermaid
flowchart LR

subgraph MainWindowController
  c1["chatArea.sendPrompt(text)"]                 
  c2["chatArea.setOption(key, value)"]            
  c3["chatArea.setModelVersion(version)"]         
  c4["chatArea.setAnswerStatus(index, collapsed)"]
  c5["chatArea.newSession()"]                     
end

subgraph Message
  m1["chat:pageId,content"]                    
  m2["setOption:pageId,key,value"]             
  m3["setModelVersion:pageId,version"]         
  m4["setAnswerStatus:pageId,index,collapsed"] 
  m5["thread:pageId"]                          
end

subgraph PageController
  p1["onMsgChat(data)"]            
  p2["onMsgSetOption(data)"]       
  p3["onMsgSetModelVersion(data)"] 
  p4["onMsgSetAnswerStatus(data)"] 
  p5["onMsgThread(data)"]          
end

subgraph PageDriver
  d1["driver.setPrompt(data.content)+driver.send()"] 
  d2["driver.setOption(data.key, data.value)"] 
  d3["driver.setModelVersion(data.version)"] 
  d4["driver.setAnswerStatus(data.index, data.collapsed)"] 
  d5["driver.newSession()"] 
end

c1 --> m1 --> p1 --> d1
c2 --> m2 --> p2 --> d2
c3 --> m3 --> p3 --> d3
c4 --> m4 --> p4 --> d4
c5 --> m5 --> p5 --> d5

```



## 4. `ChatArea` 内部选择模式状态变化

`ChatArea` 组件管理其自身的 UI 状态，包括模型和参数的选择模式。

### 4.1. 模型选择

*   **状态**：当前选定的 AI 模型提供商（例如：“Kimi”、“Gemini”、“ChatGPT”）。
*   **UI 元素**：`model-selector` 下拉菜单，`model-name` 显示。
*   **交互**：
    *   用户点击 `model-name`：切换 `model-dropdown` 的可见性。
    *   用户点击 `model-dropdown` 中的 `model-option`：
        *   更新 `model-name` 显示。
        *   触发 `onEvtProviderChanged` 事件（由 `MainWindowController` 处理）。
        *   如果 `ChatArea` 处于“强制选择”模式（最初没有 URL），它会移除覆盖层并根据新的提供商设置其 `url`。

### 4.2. 参数选择

*   **状态**：各种参数，如“网页访问”、“长思考”、“模型版本”。
*   **UI 元素**：`params-selector` 下拉菜单，`params-button` 触发器。
*   **交互**：
    *   用户点击 `params-button`：切换 `params-dropdown` 的可见性。
    *   用户更改复选框（`web-access`、`long-thought`）：
        *   触发 `onEvtParamChanged` 事件（由 `MainWindowController` 处理）。
    *   用户更改 `select` 元素（`model-version`）：
        *   触发 `onEvtParamChanged` 事件（由 `MainWindowController` 处理）。

### 4.3. 固定状态

*   **状态**：`ChatArea` 是否“固定”。固定的聊天区域在布局中具有优先权。
*   **UI 元素**：`pin-button`。
*   **交互**：
    *   用户点击 `pin-button`：切换 `pinned` 状态。
    *   更新 `pin-button` 的视觉状态（例如，添加/移除 `pinned` 类）。
    *   通知 `MainWindowController` 更新 `updateLayout` 以反映新的固定顺序。

### 4.4. 输入区域状态

*   **状态**：提示输入区域的可见性和停靠状态。
*   **UI 元素**：`input-placeholder`、`chat-area-input`、`textarea`。
*   **交互**：
    *   鼠标进入 `input-placeholder` 或 `chat-area-input`：调用 `showInput()`，使输入区域可见。
    *   `textarea` 获得焦点：调用 `dockInput()`，使输入区域可见并“停靠”（例如，扩展其高度并调整对话区域填充）。
    *   鼠标离开 `chat-area-input` 或 `textarea` 失去焦点：调用 `undockInput()`，它会启动一个计时器，如果焦点不在其中，则隐藏/取消停靠输入区域。

本文档全面概述了 Multi AI Chat Userscript 中的通信和状态管理。

---

## 6. 新建对话事件链路

当用户在主窗口点击"新建对话"按钮并选择一个 AI 提供商时，需要自动打开对应的 AI 平台页面，并建立主窗口与新页面之间的消息通信链路。

### 6.1. 事件链路概述

```mermaid
sequenceDiagram
    participant MWC as MainWindowController
    participant CA as ChatArea<br/>(pageId: page-new-xxx)
    participant TAB as 新标签页<br/>(AI 平台)
    participant PC as PageController<br/>(pageId: page-new-xxx)
    participant MSG as Message Bus

    Note over MWC,CA: 1. 用户点击新建对话按钮
    MWC->>CA: addChatArea({id: 'page-new-xxx',<br/>url: null, providerName: 'New Chat'})
    CA-->>CA: 显示 forced-selection 覆盖层

    Note over CA,TAB: 2. 用户从下拉菜单选择提供商（如 Kimi）
    CA->>MWC: onEvtProviderChanged(ca, 'Kimi', null)
    MWC->>MWC: _handleProviderChanged<br/>oldProvider=null → 新建场景
    MWC->>TAB: window.open('https://kimi.com?_chatAreaId=page-new-xxx')
    MWC->>CA: chatArea.url = newUrl

    Note over TAB,MSG: 3. 新标签页加载，油猴脚本初始化
    TAB->>PC: 脚本注入，new PageController(...)
    PC->>PC: 从 URL 读取 _chatAreaId='page-new-xxx'<br/>使用作为 pageId
    PC->>MSG: register('page-new-xxx', this)
    PC->>MSG: create({id: 'page-new-xxx', url, providerName, ...})

    Note over MSG,MWC: 4. 主窗口收到 create 消息，复用已有 ChatArea
    MSG->>MWC: onMsgCreate({id: 'page-new-xxx', ...})
    MWC->>MWC: addChatArea(data)
    MWC->>MWC: 发现 chatAreas 已有 page-new-xxx<br/>且 url=null → 复用分支
    MWC->>CA: chatArea.init(providerData)<br/>重新初始化绑定真实数据
    MWC->>CA: chatArea.updateTitle('Kimi')

    Note over MWC,PC: 5. 后续正常消息通信
    PC->>MSG: answer('page-new-xxx', index, content)
    MSG->>MWC: onMsgAnswer(data)
    MWC->>CA: handleAnswer(data)
```

### 6.2. 关键设计决策

#### 6.2.1. URL 参数传递 `_chatAreaId`

新建对话时，主窗口生成的 ChatArea 拥有一个预定义的 pageId（如 `page-new-1703123456`）。为了让新标签页的 `PageController` 使用同一个 pageId，通过 URL 查询参数 `_chatAreaId` 传递：

```
https://kimi.com?_chatAreaId=page-new-1703123456
```

`PageController` 构造函数中的处理逻辑：

```javascript
const urlParams = new URLSearchParams(window.location.search);
const chatAreaId = urlParams.get('_chatAreaId');
if (chatAreaId && chatAreaId.startsWith('page-')) {
    this.pageId = chatAreaId;
} else {
    this.pageId = this.util.generateUniqueId('page-');
}
```

#### 6.2.2. `_handleProviderChanged` 分支逻辑

| 场景 | oldProvider | 行为 |
|------|-------------|------|
| 新建 ChatArea 选择提供商 | `null` 或 `'New Chat'` | `window.open(url + '_chatAreaId=xxx')` 打开新标签页 |
| 已有 ChatArea 切换提供商 | 非 null（如 `'Kimi'`） | `msgClient.changeProvider(pageId, url)` 通知原生页面 |

#### 6.2.3. `addChatArea` 复用逻辑

当 `addChatArea(data)` 被调用且 `data.id` 对应的 ChatArea 已存在时，有三个分支：

| 分支 | 条件 | 行为 |
|------|------|------|
| ReUse 分支 | `getReadyForReUse() === true` | 新会话复用（点击 new-session 按钮后） |
| 关联分支 | `getUrl() === null` 且 `providerName !== 'New Chat'` | 新建对话被真实原生页面关联，重新初始化 |
| 冲突分支 | 其他情况 | 忽略，打印警告 |

### 6.3. 消息流图

```mermaid
flowchart TD
    A[用户点击新建对话按钮] --> B[addChatArea<br/>id=page-new-xxx<br/>url=null]
    B --> C[ChatArea 显示<br/>forced-selection 覆盖层]
    C --> D[用户选择提供商]
    D --> E[_handleProviderChanged]
    E --> F{oldProvider?}
    F -->|null / New Chat| G[window.open<br/>url + _chatAreaId]
    F -->|已有提供商| H[msgClient.changeProvider]
    G --> I[新标签页加载]
    I --> J[PageController 初始化<br/>pageId = _chatAreaId]
    J --> K[发送 create 消息]
    K --> L[onMsgCreate]
    L --> M[addChatArea]
    M --> N{ChatArea 已存在?}
    N -->|是, url=null| O[复用并重新初始化]
    N -->|否| P[新建 ChatArea]
    O --> Q[ChatArea 绑定真实数据]
    P --> Q
    Q --> R[后续正常消息通信]
```

---

## 7. 跨标签页主窗口查找

### 7.1. 问题描述

`SyncChatWindow` 需要检测主窗口是否已存在。由于 `window.top` 是每个标签页独立的作用域，不同标签页之间无法共享 JavaScript 变量。当标签页 A（如 qianwen）创建主窗口后，标签页 B（如 kimi）无法通过 `window.top.multiAiChatMainWindow` 看到这个引用。

### 7.2. 解决方案

使用 `window.open('', windowName)` 的浏览器特性：当指定名称的窗口已存在时，返回该窗口的引用而不是创建新窗口。

### 7.3. 查找流程

```mermaid
flowchart TD
    A[exist / checkAndCreateWindow] --> B{window.top 缓存引用有效?}
    B -->|是| C[返回 true / 聚焦窗口]
    B -->|否| D[window.open '', windowName]
    D --> E{返回窗口有效且 name 匹配?}
    E -->|是| F[缓存引用到 window.top]
    F --> C
    E -->|否| G[返回 false / 创建新窗口]
```

### 7.4. `exist()` 方法逻辑

1. **快速路径**：检查 `window.top.multiAiChatMainWindow` 是否有效且未关闭
2. **跨标签页查找**：通过 `window.open('', 'multi-ai-chat-main-window')` 查找已命名的窗口
3. **验证**：检查返回窗口的 `name` 属性是否匹配 `multi-ai-chat-main-window`
4. **缓存**：将找到的引用缓存到 `window.top.multiAiChatMainWindow`

### 7.5. 代码位置

| 文件 | 方法 | 说明 |
|------|------|------|
| `src/sync-chat-window.js` | `exist()` | 检查主窗口是否存在（支持跨标签页） |
| `src/sync-chat-window.js` | `checkAndCreateWindow()` | 检查并创建主窗口（支持跨标签页查找） |

---

## 5. 标识符 (ID) 数据流设计

### 5.1. 核心标识符定义

系统中有三种关键标识符，用于在不同组件之间建立关联：

| 标识符 | 生成位置 | 格式 | 用途 |
|--------|----------|------|------|
| `pageId` | `PageController` 构造函数 | `page-{timestamp}-{counter}-{random}` | 唯一标识一个原生页面实例 |
| `chatArea.id` | `ChatArea` 构造函数 | `chat-area-{timestamp}-{counter}-{random}` | 唯一标识一个聊天区域实例 |
| `mainWinId` | `main-window-initializer.js` 传入 | 自定义（通常为 `main-window`） | 主窗口的接收者 ID |

### 5.2. ID 在组件中的沉淀

```javascript
// PageController (src/page-controller.js:18)
this.pageId = this.util.generateUniqueId('page-');

// ChatArea (src/chat-area.js:33)
this.pageId = pageId;           // 关联的页面 ID
this.id = this.utils.generateUniqueId('chat-area-');  // 自己的唯一 ID

// MainWindowController (src/main-window-controller.js:23)
this.chatAreas = new Map();     // key: pageId, value: ChatArea
```

### 5.3. ID 生成流程图

```mermaid
flowchart TD
    subgraph 原生页面上下文
        A[页面加载] --> B[PageController.init]
        B --> C[生成 pageId<br/>util.generateUniqueId 'page-']
        C --> D[创建 MessageClient<br/>senderId = pageId]
        D --> E[注册消息监听<br/>message.register pageId this]
    end

    subgraph 主窗口上下文
        F[主窗口初始化] --> G[MainWindowController 构造]
        G --> H[接收 mainWinId]
        H --> I[注册消息监听<br/>message.register mainWinId this]
    end

    subgraph 连接流程
        J[用户点击同步按钮] --> K[PageController.handleSyncButtonClick]
        K --> L[发送 create 消息<br/>携带 pageId]
        L --> M[MainWindowController.onMsgCreate]
        M --> N[创建 ChatArea 实例]
        N --> O[chatArea.pageId = data.id<br/>即 pageId]
        O --> P[chatArea.id = 随机生成<br/>chat-area-xxx]
        P --> Q[chatAreas.set pageId chatArea<br/>以 pageId 为键存储]
    end

    E -.->|通过 BroadcastChannel| L
```

### 5.4. 消息路由顺序图

```mermaid
sequenceDiagram
    participant PC as PageController<br/>(pageId: page-001)
    participant MC as MessageClient<br/>(senderId: page-001)
    participant MSG as Message Bus<br/>(BroadcastChannel)
    participant MWC as MainWindowController<br/>(mainWinId)
    participant CA as ChatArea<br/>(id: chat-area-001,<br/>pageId: page-001)

    Note over PC,CA: 创建连接
    PC->>MC: new MessageClient(message, pageId)
    PC->>MSG: register(pageId, this)
    MWC->>MSG: register(mainWinId, this)

    Note over PC,CA: 用户点击同步按钮
    PC->>MC: create({id: pageId, url, ...})
    MC->>MSG: send('create', {id: pageId, ...})
    MSG->>MWC: handleMessage({type: 'create', data: {id: page-001}})
    MWC->>MWC: onMsgCreate(data)
    MWC->>CA: new ChatArea(this, pageId, url, container, i18n)
    CA-->>CA: this.pageId = page-001<br/>this.id = 随机生成 chat-area-xxx
    MWC->>MWC: chatAreas.set(page-001, chatArea)
    MWC->>MSG: register(chatArea.id, this)

    Note over PC,CA: 原生页面回答生成
    PC->>MC: answer(pageId, index, content)
    MC->>MSG: send('answer', {receiverId: pageId, index, content})
    MSG->>MWC: handleMessage({type: 'answer', data: {receiverId: page-001}})
    MWC->>MWC: onMsgAnswer(data)
    MWC->>MWC: chatArea = chatAreas.get(page-001)
    MWC->>CA: handleAnswer({index, content})

    Note over PC,CA: 主窗口发送消息到原生页面
    CA->>MWC: onEvtPromptSend(this, text)
    MWC->>MC: prompt(chatArea.pageId, text)
    MC->>MSG: send('prompt', {receiverId: page-001, text})
    MSG->>PC: handleMessage({type: 'prompt', data: {receiverId: page-001}})
    PC->>PC: onMsgPrompt(data)
    PC->>PC: driver.setPrompt(text), driver.send()
```

### 5.5. 消息中的 ID 携带规则

#### 5.5.1. 点对点消息 (包含 receiverId)

当需要将消息发送给特定接收者时，消息中携带 `receiverId` 字段：

```javascript
// MessageClient 发送示例
msgClient.prompt(receiverId, text) {
    this.message.send('prompt', {
        receiverId: receiverId,  // 目标 pageId
        text: text,
        senderId: this.senderId  // 发送者 pageId
    });
}
```

#### 5.5.2. 广播消息 (无 receiverId)

当消息需要广播给所有监听者时，不携带 `receiverId` 字段：

```javascript
// 广播示例
msgClient.chat(prompt) {
    this.message.send('chat', {
        prompt: prompt,
        senderId: this.senderId
    });
}
```

#### 5.5.3. create 消息 (特殊)

`create` 消息是唯一使用 `id` 字段而非 `receiverId` 字段的消息类型：

```javascript
// PageController -> MainWindowController
this.msgClient.create({
    id: this.pageId,              // 原生页面的 pageId
    url: window.location.href,
    providerName: this.driver.getProviderName(),
    title: this.driver.getChatTitle(),
    params: {...},
    conversation: [...]
});
```

### 5.6. ID 查找流程

当 `MainWindowController` 收到消息时，通过以下步骤定位目标 `ChatArea`：

```mermaid
flowchart TD
    A[接收消息] --> B{消息类型?}
    B -->|create| C[从 data.id 获取 pageId]
    B -->|其他| D[从 data.receiverId<br/>或 data.id 获取 pageId]

    C --> E[chatAreas.get pageId]
    D --> E

    E --> F{找到 ChatArea?}
    F -->|是| G[调用 ChatArea 方法]
    F -->|否| H[忽略消息]
```

### 5.7. 数据结构总结

| 组件 | 持有的 ID 相关属性 | 用途 |
|------|-------------------|------|
| `PageController` | `pageId` | 消息发送者标识、消息注册 receiverId |
| `ChatArea` | `id` (chat-area-xxx) | 事件处理上下文传递 |
| `ChatArea` | `pageId` | 与原生页面的关联，用于消息路由 |
| `MainWindowController` | `mainWinId` | 主窗口接收消息的标识 |
| `MainWindowController` | `chatAreas: Map<pageId, ChatArea>` | 通过 pageId 快速查找 ChatArea |
| `MessageClient` | `senderId` | 每次发送消息时携带的发送者标识 |

### 5.8. 代码中的关键位置

| 文件 | 行号 | 说明 |
|------|------|------|
| `src/page-controller.js` | 18 | `pageId` 生成 |
| `src/page-controller.js` | 21 | `MessageClient` 创建，传入 `pageId` 作为 `senderId` |
| `src/page-controller.js` | 31 | 消息注册，使用 `pageId` 作为 `receiverId` |
| `src/chat-area.js` | 31 | `pageId` 属性赋值（关联页面） |
| `src/chat-area.js` | 33 | `id` 属性赋值（自己生成） |
| `src/main-window-controller.js` | 23 | `chatAreas` Map 声明 |
| `src/main-window-controller.js` | 480 | `chatAreas.set(data.id, chatArea)` 使用 `pageId` 作为 key |
| `src/main-window-controller.js` | 352 | `chatAreas.get(data.id)` 使用 `pageId` 查找 |

### 5.9. 设计说明

1. **pageId 作为唯一关联键**：系统设计上使用 `pageId` 作为原生页面和 ChatArea 之间的唯一关联键。`chatArea.id` 主要用于内部事件处理和调试。

2. **消息路由机制**：
   - `Message` 总线通过 `receiverId` 字段实现点对点消息路由
   - 如果没有 `receiverId`，消息会广播给所有注册的监听者
   - 每个组件通过 `message.register(receiverId, listener)` 注册自己的监听器

3. **ID 生成时机**：
   - `pageId` 在 `PageController` 构造时立即生成
   - `chatArea.id` 在 `ChatArea` 构造时立即生成
   - 两者都使用 `util.generateUniqueId()` 确保全局唯一性

4. **数据一致性保证**：
   - `chatAreas` Map 始终使用 `pageId` 作为键
   - 所有从原生页面发送到主窗口的消息都携带 `pageId`（通过 `id` 或 `receiverId` 字段）
   - `ChatArea` 内部持有 `pageId` 用于反向查找和消息发送