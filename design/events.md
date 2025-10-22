# 事件与消息流设计

本文档概述了关键组件：`PageDriver`、`PageController`、`MainWindowController` 和 `ChatArea` 之间的事件和消息通信流。它详细说明了生成的事件、传输的消息、它们的结构以及订阅关系。

## 1. 组件概述

*   **`PageDriver`**：直接与原生 AI 聊天页面的 DOM 交互。根据用户操作或页面变化生成事件。
*   **`PageController`**：在原生 AI 聊天页面上运行。订阅 `PageDriver` 事件，将其转换为标准化消息，并通过 `Message` 总线发送给 `MainWindowController`。它还接收来自 `MainWindowController` 的消息，并将其转换为 `PageDriver` API 调用。
*   **`MainWindowController`**：在主用户脚本窗口中运行。订阅来自 `PageController` 实例的消息，将其转换为 `ChatArea` API 调用。它还接收来自主窗口 UI 的用户输入，并向 `PageController` 实例发送消息。
*   **`ChatArea`**：代表 `MainWindowController` UI 中的单个 AI 聊天实例。接收来自 `MainWindowController` 的 API 调用以更新其状态和显示。

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

*   `id`：`string` - `PageController` / `ChatArea` 实例的唯一标识符。用于定位特定实例。
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

| 源组件 | 事件/回调 (PageDriver) | 消息类型 (PageController -> Message) | Payload 字段 (PageController -> Message) | 目标组件 | 操作 (MainWindowController) |
| :--------------- | :-------------------------- | :--------------------------------------- | :----------------------------------------- | :--------------- | :---------------------------- |
| `PageDriver`     | `onAnswer(index, element)`  | `answer`                                 | `id`, `index`, `content`                   | `MainWindowController` | `onMsgAnswer(data)` -> `chatArea.handleAnswer(data)` |
| `PageDriver`     | `onChatTitle(title)`        | `titleChange`                            | `id`, `title`                              | `MainWindowController` | `onMsgTitleChange(data)` -> `chatArea.updateTitle(data.title)` |
| `PageDriver`     | `onOption(key, value)`      | `optionChange`                           | `id`, `key`, `value`                       | `MainWindowController` | `onMsgOptionChange(data)` -> `chatArea.updateOption(data.key, data.value)` |
| `PageDriver`     | `onQuestion(index, element)`| `question`                               | `id`, `index`, `content`                   | `MainWindowController` | `onMsgQuestion(data)` -> `chatArea.addQuestion(data.content)` |
| `PageDriver`     | `onModelVersionChange(version)` | `modelVersionChange`                     | `id`, `version`                            | `MainWindowController` | `onMsgModelVersionChange(data)` -> `chatArea.updateModelVersion(data.version)` |
| `PageDriver`     | `onNewSession()`            | `newSession`                             | `id`                                       | `MainWindowController` | `onMsgNewSession(data)` -> `chatArea.newSession()` |
| `PageController` | `handleSyncButtonClick()`   | `create`                                 | `id`, `url`, `title`                       | `MainWindowController` | `onMsgCreate(data)` -> `addChatArea(data)` |
| `PageController` | (内部)                      | `destroy`                                | `id`                                       | `MainWindowController` | `onMsgDestroy(data)` -> `removeChatArea(data.id)` |

### 3.2. `MainWindowController` -> `PageController`

`MainWindowController` 接收用户输入或内部事件，并向特定的 `PageController` 实例发送消息。然后 `PageController` 将这些消息转换为 `PageDriver` API 调用。

| 源组件 | 操作 (MainWindowController) | 消息类型 (Message -> PageController) | Payload 字段 (Message -> PageController) | 目标组件 | 操作 (PageController) |
| :--------------- | :---------------------------- | :--------------------------------------- | :----------------------------------------- | :--------------- | :---------------------- |
| `MainWindowController` | `chatArea.sendPrompt(text)` | `chat`                                   | `id`, `content`                            | `PageController` | `onMsgChat(data)` -> `driver.setPrompt(data.content)`, `driver.send()` |
| `MainWindowController` | `chatArea.setOption(key, value)` | `setOption`                              | `id`, `key`, `value`                       | `PageController` | `onMsgSetOption(data)` -> `driver.setOption(data.key, data.value)` |
| `MainWindowController` | `chatArea.setModelVersion(version)` | `setModelVersion`                        | `id`, `version`                            | `PageController` | `onMsgSetModelVersion(data)` -> `driver.setModelVersion(data.version)` |
| `MainWindowController` | `chatArea.setAnswerStatus(index, collapsed)` | `setAnswerStatus`                        | `id`, `index`, `collapsed`                 | `PageController` | `onMsgSetAnswerStatus(data)` -> `driver.setAnswerStatus(data.index, data.collapsed)` |
| `MainWindowController` | `chatArea.newSession()`     | `thread`                                 | `id`                                       | `PageController` | `onMsgThread(data)` -> `driver.newSession()` |

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