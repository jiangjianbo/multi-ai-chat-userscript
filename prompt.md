# 提示词

## 纲领

开发一个油猴脚本，让用户在 6 家 AI 聊天页面一键“同步对比”，把多家 AI 的问答汇总到独立主窗口并排展示，并保持双向实时同步。

## 名词定义

* ai对话页面：也叫做原生页面，是浏览器中输入url访问到的ai服务提供商的对话页面
* ai会话：在ai对话页面中进行人机对话的所有问答内容
* 主窗口：包含多个内容块的新页面，该窗口名字为multi-ai-sync-chat-window
* 内容块：也叫chatarea，对应一个ai会话，包含一些控制部件

## 关键约束

* 原生页面只注入“同步对比”按钮，其余逻辑通过 MessageNotifier（BroadcastChannel + postMessage）与主窗口通讯。
* 主窗口为独立 tab，可 1/2/3/4/6 分栏布局；每栏对应一家 AI，栏内支持切换 AI、复制、折叠、分享、新建会话、输入对话。
* 默认支持 8 种语言，UI 文案全部用 key 引用，i18n 表放附录。

## 主干流程

### 阶段 1：脚本启动

1. 延迟 3 秒 → 检测当前 URL → 匹配 AI供应商驱动（附录 B） → 注入按钮 “同步对比”
2. 利用AI供应商驱动对原生页面的对话内容进行修饰，为每条 AI 回答追加悬浮工具栏（复制 / 折叠 / 隐藏 / 分享）。
3. 按钮点击 → 若主窗口不存在则 window.open('multi-ai-sync-chat-window')；否则激活。
4. 向主窗口发 create 消息：{url, tabId, config}。

### 阶段 2：主窗口渲染

1. 读取 localStorage 配置（附录 C） → 渲染顶部栏（标题、语言、布局、配置、新对话） + 底部提示词栏。
2. 根据布局数字（1/2/3/4/6）生成 div 网格；每个 div 内挂 内容块。
3. 内容块 收到 create → 创建 iframe → 渲染标题栏与隐藏输入框。

### 阶段 3：双向同步

1. 主窗口发送 chat 消息 → 原生页面填输入框并点击发送。
2. 原生页面回答完成后发送 answer → 主窗口对应 内容块 渲染。
3. 其余消息（config / thread / share）同理，见附录 D 协议。

## 附录

### 附录 A：代码风格

#### 关于面向对象的风格

1. 生成的对象方法代码要有方法java doc风格的注释，包括方法体、参数、返回值的说明
2. 类的变量名称要避免使用window这种关键字
3. 用传统的function模拟对象，类似 `function ClassA(){ this.prop = xxx; this.method=function(){}; }`的类定义形式，继承方式类似`function ClassB(args){ ClassA.call(this, args); this.methodB=function(){}; }`，忽略所有的prototype链操作。类的所有成员函数都用 `this.method = function(){}`的方式，并且提供统一的`this.init()`方法做初始化。

#### 关于html生成

1. 代码中不要直接使用html语句，请使用跟html能够一一对应的json格式，用花括号表示嵌套，用`tag:value`表示节点和值，用`@attr:value`表示html节点的属性。
2. 如果value为function对象，则生成时候用function.toString()嵌入源代码
3. 调用`Utils`类的`toHtml(json)`生成html代码，例如`const html = xxx.toHtml(json);`
4. 例：json `html:{head:{title:'page1',script:Func1}, body:{div:{'@text':'hello!'}}}`，对应html为`<html><head><title>page1</title><script>...</script></head><body>...</body></html>`
5. 我不喜欢在js里使用模板字符串里嵌入超长的html代码或超长的字符串形式的js代码（超过10行）。

#### 其他

1. 全局常量包含在Consts类，全局工具类放在Utils类中，都需要new了之后再用。
2. 每个功能要考虑可以测试和可调试，尤其是打开新窗口嵌入html这种方式，要能够以div模拟窗口的方式在本页进行测试和调试，并在正式运行时候使用打开新窗口的方式运行。
3. 关键要点要用console.log、console.debug等输出日志，便于分析
4. 响应通讯消息的对象成员函数用onMsg前缀开头，每个对象在构造时候自动遍历成员函数进行自动注册。例如this.onMsgChat函数会自动注册为消息chat的回调，this.onMsgConfig则注册为config消息的回调。
5. 油猴脚本对window等系统对象有特别保护，需要特殊方法才能修改系统对象
6. 

### 附录 B：AI 驱动映射表

默认支持的ai提供商包括如下6个：

* www.kimi.com/chat/
* https://gemini.google.com/
* https://chatgpt.com/
* https://chat.deepseek.com/
* https://x.com/i/grok
* https://www.tongyi.com/

页面和驱动的对应关系为：kimi → KimiPageDriver, gemini → GeminiPageDriver以此类推。提供通用页面策略GenericPageDriver存放共性，以及未来的新供应商支持。

#### 选择器详情

| 选择器类型 | GenericPageDriver | KimiPageDriver (继承自Generic) | GeminiPageDriver (继承自Generic) | ChatGPTPageDriver (继承自Generic) |
| --- | --- | --- | --- | --- |
| `inputArea` | `input[type="text"]`, `textarea`, `.ql-editor`, `.chat-input-editor` | `#prompt-textarea` | `.ql-editor` | `#prompt-textarea` |
| `sendButton` | `button[type="submit"]`, `.send-button`, `.send-btn`, `button[aria-label="发送"]` | `.send-button` | `button[aria-label="发送"]`, `.send-button` | `[data-testid="send-button"]` |
| `chatHistory` | `.chat-messages`, `.messages`, `#chat-area`, `.chat-history-scroll-container` | `.chat-messages-container`, `.history-part` | `.chat-history-scroll-container`, `.conversations-container` | | 
| `messageItem` | `.message`, `.chat-message`, `.conversation-container`, `.message-content` | `.message-item`, `li` | `.conversation-container`, `.conversation` | |
| `userMessage` | `.user-message`, `.segment-user`, `.user-query-container` | `.user-content` | `.query-text` | |
| `aiMessage` | `.ai-message`, `.segment-assistant`, `.model-response-container` | `.assistant-message`, `.chat-content-item-assistant` | `.model-response-container` | |
| `responseParagraph` | `.paragraph`, `div[class*="content"]`, `div[class*="response"]` | `.chat-name` | `.conversation-title` | |
| `newChatButton` | `.new-chat-button`, `.new-conversation`, `button[data-test-id="new-chat-button"]` | `.new-chat-btn` | `button[data-test-id="new-chat-button"]` | |
| `sessionTitle` | `h1.title`, `h2.session-title`, `.chat-header-content h2`, `.conversation-title` | `h2.session-title` | `h1.title` | |

### 附录 C：localStorage 结构

* 存储 key 固定为 multi_ai_sync_config
* 用如下json结构存储AI供应商的配置信息、布局信息和语言设置

```json
{providers: [{name,url},…], layout:3, lang:'zh'}
```

### 附录 D：通讯协议 JSON Schema

* create：原生窗口通知主窗口创建一个内容块，携带参数url为原生窗口的url，tabId为浏览器为原生窗口赋予的唯一名称，config为一个json，包含原生窗口中各种配置按钮的状态：登录用户名、联网模式、模型选择、长思考，以及其他ai专有的状态（如grok的X搜索开关等）
* chat：主窗口通知原生窗口增加一个问题，携带参数为chatId表示问题的编号，message包含用户输入的文字，原生窗口收到之后往输入内容区填写文字并模拟点击发送按钮。在接收到ai的回答之后，会产生answer消息发回给主窗口。
* answer：原生窗口通知主窗口有回答了，携带参数包括url、tabId、chatId，answerTime为回复日期时间，answer为回答的innerhtml内容
* config：主窗口通知原生窗口设置各种配置按钮的状态，携带参数为配置按钮名词和bool类型的开关值，参考create的config说明
* thread_create：主窗口通知原生窗口结束当前会话，并创建一个新会话。创建新会话之后会反向发送一个thread_return消息
* thread_return：原生窗口通知主窗口一个新会话创建完毕，参数跟create消息相同
* share_create：主窗口通知原生窗口创建一个对话信息的share链接，携带消息为chatId的数组。根据不同ai提供商的特性，可以执行整个会话共享、选择对话共享、如果只有一个chatId则单个对话共享等
* share_return：原生窗口通知主窗口

### 附录 E：国际化

* 默认支持多语言，包括英语、中文、法语、日语、朝鲜语、西班牙语、葡萄牙语、阿拉伯语
* 根据浏览器当前语言切换，要注意阿拉伯语的从右向左的写作方式的支持。

### 附录F：窗口布局

窗口的所有标题、按钮等都需要默认图标

1. 主窗口布局
     1. 主窗口为独立的tab页（浏览器支持tab页）或新正常浏览窗口（浏览器不支持tab页），布局从上到下为：
          * 顶部标题栏：内部从左到右为标题“多个AI同步聊天”，标题后紧跟多语言切换下拉框（用地球icon表示，点击下拉之后对应激活语言前有打勾），然后是居中的布局按钮组可以切换1、2、3、4、6个内容块的布局（最好能有icon表示这些布局，布局1和2和3为单行多列，4为2行2列，6为2行3列），然后是居右的按钮组，组内从左到右是配置按钮和新对话按钮。这些按钮都最好用icon表示，鼠标浮动上去才显示按钮名称。
          * 最底下是提示词栏，从左到右包含一个文本输入框，可以输入聊天的提示词，输入框右侧是一个发送按钮。其中发送按钮是固定宽度，剩余的宽度被文本输入框填充（支持跟随窗口宽度的变化）。
          * 主内容区域：填充窗口剩余部分，根据布局排列div，每个div可以放入一个chatarea。
          * 配置窗口：配置按钮点击出现配置窗口，用来配置ai提供商的名称和网址，默认包含刚才说的6个提供商，所有提供商都存储在local storage中。配置窗口中有一个装入默认值的按钮，负责装入默认的ai提供商清单。
     2. 内容块的创建：新增加一个内容块，会在把当前布局切换到下一个更多内容块的布局，并且创建chatarea对象。
2. 内容块布局
     * 区域顶部标题：从左到右包含：
         * ai名称，左对齐，可下拉列表中切换ai，新ai的区域会替换当前区域的位置，如果当前内容块已经有内容变化，则提示是否切换，用户确认要切换之后再切换。提示框用自制的非阻塞弹出框，且仅显示在区域里。如果ai名称没有对应的原生窗口，则自动在后台打开一个。
         * web检索标志开关，跟ai名称在同一组都是左对齐，点击之后会切换里的检索标志开关（如果有的话），
         * 分享标志，跟关闭对话框同一组，都是右对齐，点击之后显示分享的链接。
         * 独立窗口打开标志，跟关闭对话框按钮在同一组，都是右对齐，点击之后在新窗口中打开chatarea的url，但是如果已经有原生窗口了，就激活原生窗口。
         * 关闭内容块标志，右对齐，在最右边，点击之后关闭当前内容块，但影响对应的原生窗口
     * 区域底部隐藏的专用输入框，鼠标移动到区域内则浮动出现向上箭头，不影响区域其他元素布局，点击箭头之后才出现浮动专用输入框，输入后回车就发送消息到原生页面，然后输入框焦点消失的话就自动隐藏，等到鼠标移入区域显示向上箭头。
     * 区域内容：填充区域剩余部分，并展示原生页面发送消息过来的对话内容。
