// ==UserScript==
// @name         多AI同步聊天
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  同时与多个AI聊天并同步对比结果
// @author       You
// @match        https://www.kimi.com/chat/*
// @match        https://gemini.google.com/*
// @match        https://chat.openai.com/*
// @match        https://chat.deepseek.com/*
// @match        https://x.com/i/grok
// @match        https://www.tongyi.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 确保页面加载完成后再执行初始化
    if (document.readyState === 'complete') {
        injectSyncButton();
    } else {
        window.addEventListener('load', () => {
            // 延迟5秒后执行初始化
            setTimeout(injectSyncButton, 5000);
        });
    }

    // 注入同步对比按钮
    function injectSyncButton() {
        const button = document.createElement('button');
        button.id = 'sync-chat-button';
        button.textContent = '同步对比';
        button.style.position = 'fixed';
        button.style.top = '20px';
        button.style.right = '20px';
        button.style.zIndex = '9999';
        button.style.padding = '10px 15px';
        button.style.backgroundColor = '#4CAF50';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

        document.body.appendChild(button);

        button.addEventListener('click', () => {
            let chatWindow = window.open('', 'multi-ai-sync-chat-window');
            if (chatWindow.document.body.innerHTML === '') {
                // 创建新窗口
                const syncChatWindow = new SyncChatWindow(chatWindow);
                syncChatWindow.init();
            }
            // 发送当前URL到主窗口
            chatWindow.postMessage({type: 'createBlock', url: window.location.href}, '*');
        });
    }

    // 同步聊天窗口类
    function SyncChatWindow(window) {
        this.window = window;
        this.chatAreas = [];
        this.currentLayout = 1;
        this.layouts = [1, 2, 3, 4, 6];

        // 初始化窗口
        this.init = function() {
            const doc = this.window.document;
            doc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>多个AI同步聊天</title>
                    <style>
                        body, html {
                            margin: 0;
                            padding: 0;
                            height: 100%;
                            overflow: hidden;
                        }
                        .container {
                            display: flex;
                            flex-direction: column;
                            height: 100vh;
                        }
                        .title-bar {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 10px;
                            background-color: #f0f0f0;
                            border-bottom: 1px solid #ddd;
                        }
                        .layout-buttons {
                            display: flex;
                            gap: 5px;
                        }
                        .layout-btn {
                            padding: 5px 10px;
                            cursor: pointer;
                        }
                        .prompt-bar {
                            display: flex;
                            padding: 10px;
                            background-color: #f0f0f0;
                            border-top: 1px solid #ddd;
                        }
                        .prompt-input {
                            flex-grow: 1;
                            padding: 8px;
                            margin-right: 10px;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                        }
                        .send-btn {
                            padding: 8px 15px;
                            background-color: #4CAF50;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                        }
                        .chat-areas {
                            flex-grow: 1;
                            display: grid;
                            grid-template-columns: 1fr;
                            gap: 10px;
                            padding: 10px;
                            overflow: auto;
                        }
                        .chat-area {
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            overflow: hidden;
                            display: flex;
                            flex-direction: column;
                            height: 100%;
                        }
                        .chat-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 8px;
                            background-color: #f9f9f9;
                            border-bottom: 1px solid #ddd;
                        }
                        .chat-iframe {
                            flex-grow: 1;
                            border: none;
                        }
                        .input-toggle {
                            display: none;
                            padding: 8px;
                            background-color: #f9f9f9;
                            border-top: 1px solid #ddd;
                            text-align: center;
                            cursor: pointer;
                        }
                        .chat-area:hover .input-toggle {
                            display: block;
                        }
                        .native-input {
                            display: none;
                            padding: 8px;
                            background-color: #f9f9f9;
                            border-top: 1px solid #ddd;
                        }
                        .input-toggle:hover + .native-input, .native-input:hover {
                            display: block;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="title-bar">
                            <h3>多个AI同步聊天</h3>
                            <div class="layout-buttons">
                                ${this.layouts.map(layout => `<button class="layout-btn" data-layout="${layout}">${layout}</button>`).join('')}
                            </div>
                            <button id="new-chat-btn">新建对话</button>
                        </div>
                        <div class="chat-areas" id="chat-areas-container"></div>
                        <div class="prompt-bar">
                            <input type="text" id="prompt-input" class="prompt-input" placeholder="输入提示词...">
                            <button id="send-prompt-btn" class="send-btn">发送</button>
                        </div>
                    </div>
                    <script>
                        ${InjectionController.toString()}

                        window.addEventListener('message', function(event) {
                            if (event.data.type === 'createBlock') {
                                // 创建新的聊天区域
                                createChatArea(event.data.url);
                            }
                        });

                        function createChatArea(url) {
                            // 这里会被外部脚本替换
                            return 'chat-area-id';
                        }

                        document.getElementById('send-prompt-btn').addEventListener('click', function() {
                            const prompt = document.getElementById('prompt-input').value;
                            if (prompt) {
                                // 发送消息到所有iframe
                                const iframes = document.querySelectorAll('.chat-iframe');
                                iframes.forEach(iframe => {
                                    iframe.contentWindow.postMessage({type: 'newMsg', text: prompt}, '*');
                                });
                                document.getElementById('prompt-input').value = '';
                            }
                        });
                    </script>
                </body>
                </html>
            `);
            doc.close();

            // 设置布局切换事件
            this.setupLayoutButtons();

            // 保存对创建聊天区域函数的引用
            this.window.createChatArea = (url) => this.createChatArea(url);
        };

        // 设置布局按钮事件
        this.setupLayoutButtons = function() {
            const doc = this.window.document;
            this.layouts.forEach(layout => {
                const btn = doc.querySelector(`.layout-btn[data-layout="${layout}"]`);
                btn.addEventListener('click', () => this.changeLayout(layout));
            });

            // 新对话按钮事件
            doc.getElementById('new-chat-btn').addEventListener('click', () => {
                this.createChatArea(window.location.href);
            });
        };

        // 更改布局
        this.changeLayout = function(layout) {
            this.currentLayout = layout;
            const container = this.window.document.getElementById('chat-areas-container');

            // 设置网格模板
            if (layout === 1) {
                container.style.gridTemplateColumns = '1fr';
            } else if (layout === 2) {
                container.style.gridTemplateColumns = '1fr 1fr';
            } else if (layout === 3) {
                container.style.gridTemplateColumns = '1fr 1fr 1fr';
            } else if (layout === 4) {
                container.style.gridTemplateColumns = '1fr 1fr';
                container.style.gridTemplateRows = '1fr 1fr';
            } else if (layout === 6) {
                container.style.gridTemplateColumns = '1fr 1fr 1fr';
                container.style.gridTemplateRows = '1fr 1fr';
            }
        };

        // 创建聊天区域
        this.createChatArea = function(url) {
            // 增加布局（如果需要）
            const nextLayoutIndex = this.layouts.indexOf(this.currentLayout) + 1;
            if (nextLayoutIndex < this.layouts.length && this.chatAreas.length + 1 > this.currentLayout) {
                this.changeLayout(this.layouts[nextLayoutIndex]);
            }

            const container = this.window.document.getElementById('chat-areas-container');
            const chatAreaId = `chat-area-${Date.now()}`;

            // 创建聊天区域元素
            const chatArea = document.createElement('div');
            chatArea.id = chatAreaId;
            chatArea.className = 'chat-area';

            // 聊天区域标题
            const chatHeader = document.createElement('div');
            chatHeader.className = 'chat-header';

            // AI选择下拉框
            const aiSelect = document.createElement('select');
            aiSelect.innerHTML = `
                <option value="auto">自动识别</option>
                <option value="kimi">Kimi</option>
                <option value="gemini">Gemini</option>
                <option value="chatgpt">ChatGPT</option>
                <option value="deepseek">DeepSeek</option>
                <option value="grok">Grok</option>
                <option value="tongyi">通义千问</option>
            `;
            aiSelect.addEventListener('change', function() {
                // 切换AI逻辑
            });

            // 网络检索开关
            const searchToggle = document.createElement('span');
            searchToggle.innerHTML = '🔍';
            searchToggle.title = '网络检索';
            searchToggle.style.cursor = 'pointer';
            searchToggle.addEventListener('click', function() {
                const iframe = chatArea.querySelector('.chat-iframe');
                iframe.contentWindow.postMessage({type: 'config', name: 'webSearch', value: !this.classList.contains('active')}, '*');
                this.classList.toggle('active');
            });

            // 分享按钮
            const shareBtn = document.createElement('span');
            shareBtn.innerHTML = '🔗';
            shareBtn.title = '分享';
            shareBtn.style.cursor = 'pointer';
            shareBtn.addEventListener('click', function() {
                const iframe = chatArea.querySelector('.chat-iframe');
                iframe.contentWindow.postMessage({type: 'share'}, '*');
            });

            // 在新窗口打开按钮
            const openInNewWindowBtn = document.createElement('span');
            openInNewWindowBtn.innerHTML = '🗗';
            openInNewWindowBtn.title = '在新窗口打开';
            openInNewWindowBtn.style.cursor = 'pointer';
            openInNewWindowBtn.addEventListener('click', function() {
                const iframe = chatArea.querySelector('.chat-iframe');
                window.open(iframe.src, '_blank');
            });

            // 关闭按钮
            const closeBtn = document.createElement('span');
            closeBtn.innerHTML = '❌';
            closeBtn.title = '关闭';
            closeBtn.style.cursor = 'pointer';
            closeBtn.addEventListener('click', function() {
                container.removeChild(chatArea);
                // 更新聊天区域数组
                const index = this.chatAreas.findIndex(area => area.id === chatAreaId);
                if (index !== -1) {
                    this.chatAreas.splice(index, 1);
                }
                // 调整布局
                if (this.chatAreas.length < this.currentLayout && this.currentLayout > 1) {
                    const newLayoutIndex = Math.max(0, this.layouts.indexOf(this.currentLayout) - 1);
                    this.changeLayout(this.layouts[newLayoutIndex]);
                }
            }.bind(this));

            // 组装标题栏
            chatHeader.appendChild(aiSelect);
            chatHeader.appendChild(searchToggle);
            chatHeader.appendChild(shareBtn);
            chatHeader.appendChild(openInNewWindowBtn);
            chatHeader.appendChild(closeBtn);

            // 创建iframe
            const iframe = document.createElement('iframe');
            iframe.className = 'chat-iframe';
            iframe.src = url;

            // 创建输入切换按钮
            const inputToggle = document.createElement('div');
            inputToggle.className = 'input-toggle';
            inputToggle.innerHTML = '↑';

            // 创建原生输入框容器
            const nativeInputContainer = document.createElement('div');
            nativeInputContainer.className = 'native-input';

            // 组装聊天区域
            chatArea.appendChild(chatHeader);
            chatArea.appendChild(iframe);
            chatArea.appendChild(inputToggle);
            chatArea.appendChild(nativeInputContainer);

            // 添加到容器
            container.appendChild(chatArea);

            // 创建ChatArea对象
            const newChatArea = new ChatArea(chatAreaId, iframe, url);
            this.chatAreas.push(newChatArea);

            return chatAreaId;
        };
    }

    // 聊天区域类
    function ChatArea(id, iframe, url) {
        this.id = id;
        this.iframe = iframe;
        this.url = url;
        this.aiType = this.detectAiType(url);

        // 初始化
        this.init = function() {
            // 等待iframe加载完成
            this.iframe.onload = () => {
                // 注入控制器代码
                this.injectController();
            };
        };

        // 检测AI类型
        this.detectAiType = function(url) {
            if (url.includes('kimi.com')) return 'kimi';
            if (url.includes('gemini.google.com')) return 'gemini';
            if (url.includes('chat.openai.com')) return 'chatgpt';
            if (url.includes('chat.deepseek.com')) return 'deepseek';
            if (url.includes('x.com/i/grok')) return 'grok';
            if (url.includes('tongyi.com')) return 'tongyi';
            return 'unknown';
        };

        // 注入控制器
        this.injectController = function() {
            try {
                // 创建脚本元素
                const script = this.iframe.contentDocument.createElement('script');
                script.textContent = `
                    // 注入控制器
                    ${InjectionController.toString()}

                    // 初始化控制器
                    const controller = new InjectionController('${this.aiType}');
                    controller.init();

                    // 设置消息监听器
                    window.addEventListener('message', function(event) {
                        controller.handleMessage(event.data);
                    });
                `;

                // 注入脚本
                this.iframe.contentDocument.body.appendChild(script);
            } catch (e) {
                console.error('注入控制器失败:', e);
            }
        };

        // 初始化
        this.init();
    }

    // 注入控制器类
    function InjectionController(aiType) {
        this.aiType = aiType;

        // 初始化
        this.init = function() {
            // 隐藏原生输入框
            this.hideNativeElements();

            // 修改对话样式，添加工具条
            this.modifyConversationStyle();

            // 初始处理已有的对话
            this.processExistingMessages();

            // 设置突变观察器，监控新消息
            this.setupMutationObserver();
        };

        // 隐藏原生元素
        this.hideNativeElements = function() {
            // 根据AI类型执行不同的隐藏策略
            switch(this.aiType) {
                case 'chatgpt':
                    // 隐藏ChatGPT的输入框
                    const chatgptInput = document.querySelector('textarea[placeholder="发送消息..."]');
                    if (chatgptInput) {
                        chatgptInput.parentElement.parentElement.style.display = 'none';
                    }
                    break;
                case 'gemini':
                    // 隐藏Gemini的输入框
                    const geminiInput = document.querySelector('textarea[placeholder="Message Gemini"]');
                    if (geminiInput) {
                        geminiInput.parentElement.style.display = 'none';
                    }
                    break;
                    // 其他AI类型的处理...
                default:
                    // 尝试通用方法隐藏输入框
                    const genericInput = document.querySelector('textarea');
                    if (genericInput) {
                        genericInput.parentElement.style.display = 'none';
                    }
            }

            // 隐藏其他不必要的元素
            const headers = document.querySelectorAll('header');
            headers.forEach(header => {
                header.style.display = 'none';
            });

            const footers = document.querySelectorAll('footer');
            footers.forEach(footer => {
                footer.style.display = 'none';
            });
        };

        // 修改对话样式
        this.modifyConversationStyle = function() {
            // 创建样式元素
            const style = document.createElement('style');
            style.textContent = `
                .message-tools {
                    display: none;
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background-color: rgba(255, 255, 255, 0.8);
                    padding: 5px;
                    border-radius: 3px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                .message-container:hover .message-tools {
                    display: block;
                }
                .message-tool {
                    cursor: pointer;
                    margin-left: 5px;
                }
                .message-container {
                    position: relative;
                    padding-right: 40px;
                }
                .collapsed {
                    max-height: 100px;
                    overflow: hidden;
                }
                .hidden {
                    display: none;
                }
            `;
            document.head.appendChild(style);
        };

        // 处理现有消息
        this.processExistingMessages = function() {
            // 根据AI类型获取消息元素
            let messages;
            switch(this.aiType) {
                case 'chatgpt':
                    messages = document.querySelectorAll('div[data-message-author-role="assistant"]');
                    break;
                case 'gemini':
                    messages = document.querySelectorAll('div[data-testid="message-container"]');
                    break;
                    // 其他AI类型的处理...
                default:
                    // 尝试通用方法
                    messages = document.querySelectorAll('.markdown-body, .prose');
            }

            // 为每个消息添加工具条
            messages.forEach(message => {
                this.addMessageTools(message);
            });
        };

        // 添加消息工具条
        this.addMessageTools = function(message) {
            // 确保消息容器存在
            let container = message;
            if (!container.classList.contains('message-container')) {
                container = document.createElement('div');
                container.className = 'message-container';
                message.parentNode.insertBefore(container, message);
                container.appendChild(message);
            }

            // 检查是否已添加工具条
            if (container.querySelector('.message-tools')) return;

            // 创建工具条
            const tools = document.createElement('div');
            tools.className = 'message-tools';

            // 复制按钮
            const copyBtn = document.createElement('span');
            copyBtn.className = 'message-tool';
            copyBtn.innerHTML = '📋';
            copyBtn.title = '复制';
            copyBtn.addEventListener('click', () => {
                const text = message.textContent;
                navigator.clipboard.writeText(text).then(() => {
                    copyBtn.innerHTML = '✅';
                    setTimeout(() => copyBtn.innerHTML = '📋', 2000);
                });
            });

            // 折叠/展开按钮
            const collapseBtn = document.createElement('span');
            collapseBtn.className = 'message-tool';
            collapseBtn.innerHTML = '↕️';
            collapseBtn.title = '折叠/展开';
            collapseBtn.addEventListener('click', () => {
                message.classList.toggle('collapsed');
            });

            // 隐藏按钮
            const hideBtn = document.createElement('span');
            hideBtn.className = 'message-tool';
            hideBtn.innerHTML = '👁️';
            hideBtn.title = '隐藏';
            hideBtn.addEventListener('click', () => {
                container.classList.toggle('hidden');
            });

            // 添加工具到工具条
            tools.appendChild(copyBtn);
            tools.appendChild(collapseBtn);
            tools.appendChild(hideBtn);

            // 添加工具条到容器
            container.appendChild(tools);
        };

        // 设置突变观察器
        this.setupMutationObserver = function() {
            // 选择要观察的目标节点
            const targetNode = document.body;

            // 观察器的配置（需要观察什么变动）
            const config = {
                childList: true,
                subtree: true
            };

            // 创建一个观察器实例并传入回调函数
            const observer = new MutationObserver(mutationsList => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        // 检查新增的节点
                        mutation.addedNodes.forEach(node => {
                            // 如果节点是元素节点
                            if (node.nodeType === 1) {
                                // 根据AI类型检查是否是新消息
                                let isMessage = false;
                                switch(this.aiType) {
                                    case 'chatgpt':
                                        isMessage = node.getAttribute('data-message-author-role') === 'assistant';
                                        break;
                                    case 'gemini':
                                        isMessage = node.querySelector('div[data-testid="message-container"]') !== null;
                                        break;
                                        // 其他AI类型的处理...
                                    default:
                                        // 通用检查
                                        isMessage = node.classList.contains('markdown-body') || node.classList.contains('prose');
                                }

                                if (isMessage) {
                                    this.addMessageTools(node);
                                } else {
                                    // 检查节点的子节点
                                    const messages = node.querySelectorAll('.markdown-body, .prose');
                                    messages.forEach(message => {
                                        this.addMessageTools(message);
                                    });
                                }
                            }
                        });
                    }
                }
            });

            // 开始观察目标节点
            observer.observe(targetNode, config);
        };

        // 处理消息
        this.handleMessage = function(message) {
            switch(message.type) {
                case 'newMsg':
                    this.sendMessage(message.text);
                    break;
                case 'share':
                    this.shareConversation();
                    break;
                case 'newChat':
                    this.startNewChat();
                    break;
                case 'config':
                    this.updateConfig(message.name, message.value);
                    break;
            }
        };

        // 发送消息
        this.sendMessage = function(text) {
            switch(this.aiType) {
                case 'chatgpt':
                    // 找到ChatGPT的输入框
                    const chatgptInput = document.querySelector('textarea[placeholder="发送消息..."]');
                    if (chatgptInput) {
                        // 填充文本
                        chatgptInput.value = text;

                        // 触发输入事件
                        const event = new Event('input', { bubbles: true });
                        chatgptInput.dispatchEvent(event);

                        // 找到发送按钮并点击
                        const sendButton = chatgptInput.parentElement.querySelector('button');
                        if (sendButton) {
                            sendButton.click();
                        }
                    }
                    break;
                case 'gemini':
                    // 找到Gemini的输入框
                    const geminiInput = document.querySelector('textarea[placeholder="Message Gemini"]');
                    if (geminiInput) {
                        // 填充文本
                        geminiInput.value = text;

                        // 触发输入事件
                        const event = new Event('input', { bubbles: true });
                        geminiInput.dispatchEvent(event);

                        // 找到发送按钮并点击
                        const sendButton = geminiInput.parentElement.querySelector('button');
                        if (sendButton) {
                            sendButton.click();
                        }
                    }
                    break;
                    // 其他AI类型的处理...
                default:
                    // 尝试通用方法
                    const genericInput = document.querySelector('textarea');
                    if (genericInput) {
                        // 填充文本
                        genericInput.value = text;

                        // 触发输入事件
                        const event = new Event('input', { bubbles: true });
                        genericInput.dispatchEvent(event);

                        // 找到发送按钮并点击
                        const sendButton = genericInput.parentElement.querySelector('button');
                        if (sendButton) {
                            sendButton.click();
                        }
                    }
            }
        };

        // 分享对话
        this.shareConversation = function() {
            // 根据AI类型执行不同的分享逻辑
            switch(this.aiType) {
                case 'chatgpt':
                    // 找到分享按钮并点击
                    const shareButton = document.querySelector('button[data-testid="share-link"]');
                    if (shareButton) {
                        shareButton.click();

                        // 等待分享模态框出现，然后复制链接
                        setTimeout(() => {
                            const copyButton = document.querySelector('button[data-testid="copy-button"]');
                            if (copyButton) {
                                copyButton.click();
                            }
                        }, 500);
                    }
                    break;
                case 'gemini':
                    // 找到分享按钮并点击
                    const geminiShareButton = document.querySelector('button[aria-label="Share"]');
                    if (geminiShareButton) {
                        geminiShareButton.click();

                        // 等待分享模态框出现，然后复制链接
                        setTimeout(() => {
                            const copyButton = document.querySelector('button[data-test-id="copy-tooltip-button"]');
                            if (copyButton) {
                                copyButton.click();
                            }
                        }, 500);
                    }
                    break;
                    // 其他AI类型的处理...
            }
        };

        // 开始新对话
        this.startNewChat = function() {
            // 根据AI类型执行不同的新对话逻辑
            switch(this.aiType) {
                case 'chatgpt':
                    // 找到新对话按钮并点击
                    const newChatButton = document.querySelector('a[href="/chat"]');
                    if (newChatButton) {
                        newChatButton.click();
                    }
                    break;
                case 'gemini':
                    // 找到新对话按钮并点击
                    const geminiNewChatButton = document.querySelector('button[aria-label="New chat"]');
                    if (geminiNewChatButton) {
                        geminiNewChatButton.click();
                    }
                    break;
                    // 其他AI类型的处理...
            }
        };

        // 更新配置
        this.updateConfig = function(name, value) {
            // 根据配置名称执行不同的操作
            if (name === 'webSearch') {
                // 处理网络搜索配置
                switch(this.aiType) {
                    case 'chatgpt':
                        // 找到网络搜索开关并切换
                        const webSearchToggle = document.querySelector('button[aria-label="Toggle web browsing"]');
                        if (webSearchToggle) {
                            // 检查当前状态并切换
                            const isActive = webSearchToggle.getAttribute('aria-pressed') === 'true';
                            if (isActive !== value) {
                                webSearchToggle.click();
                            }
                        }
                        break;
                        // 其他AI类型的处理...
                }
            }
            // 其他配置的处理...
        };
    }
})();
