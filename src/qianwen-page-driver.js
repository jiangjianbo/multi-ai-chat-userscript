const Util = require('./util');
const { GenericPageDriver } = require('./page-driver');
const { DriverFactory, registerDriver } = require('./driver-factory');

/**
 * 通义千问 (Qianwen) 页面驱动
 */
class QianwenPageDriver extends GenericPageDriver {

    constructor() {
        super();
        const qianwenSelectors = {
            syncButtonContainer: 'div#qianwen-main-area ', // 同步按钮存放的容器选择器
            
            // 输入框：Slate 编辑器的 contenteditable div
            promptInput: 'div[contenteditable="true"][role="textbox"]',
            // 发送按钮：通过 aria-label 定位
            sendButton: 'div[data-chat-input-bottom-bar="true"] button:has(span[data-role="icon"][data-render-as="svg"][data-icon-type="qwpcicon-sendChat"])',
            // 用户提问项（class 包含 questionItem 的 div）
            questions: 'div[data-chat-list-key$="-question"] div[class^="questionItem"] div[class^="content-"]',
            // AI 回答项（class 包含 answerItem 的 div）
            answers: 'div[data-chat-list-key$="-question-A"] div[class^="answerItem-"]',
            // 完整的答案可能包含思考内容和真正的结果内容
            answer_result: '[class^="containerWrap"] > [class^="content-"]',
            // 对话区域：消息列表滚动容器
            conversationArea: '.message-list-scroll-container',
            // 历史记录项：侧边栏滚动列表的直接子元素
            historyItems: '.sider-scrollbar > div',
            // 新建对话按钮：通过图标类型定位
            newSessionButton: 'aside button:has([data-icon-type="qwpcicon-newDialogue"])',
            // 深度思考选项按钮
            longThoughtOption: '',
            // 网络搜索选项
            webAccessOption: '',
            // 模型版本相关
            modelVersionList: '',
            currentModelVersion: '',
        };
        this.selectors = Object.assign({}, this.selectors, qianwenSelectors);

        this.providerName = 'Qianwen';
    }

    /**
     * @description 获取会话标题。千问没有明确的标题元素，从侧边栏当前选中项获取。
     * @returns {string} 会话标题
     */
    getChatTitle() {
        // 千问的对话标题在侧边栏中，当前激活项有特殊背景色
        // 优先尝试从侧边栏的选中项获取
        const sidebar = document.querySelector('aside');
        if (sidebar) {
            const items = sidebar.querySelectorAll('.sider-scrollbar div[class*="group"]');
            for (const item of items) {
                const style = window.getComputedStyle(item);
                // 当前选中的项有不同的背景色
                if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                    const titleEl = item.querySelector('[class*="text-ellipsis"]');
                    if (titleEl && titleEl.textContent.trim()) {
                        return titleEl.textContent.trim();
                    }
                }
            }
        }
        return '';
    }

    /**
     * @description 获取指定索引的问题内容。从 questionItem 中提取纯文本。
     * @param {number} index - 问题索引
     * @returns {string} 问题内容
     */
    getQuestion(index) {
        const el = this.elementQuestion(index);
        if (!el) return '';
        // 问题文本在 content 容器内
        const contentEl = el.querySelector('[class*="content-"]');
        if (contentEl) {
            return contentEl.textContent.trim();
        }
        return el.textContent.trim();
    }

    /**
     * @description 获取所有选项的键值对。千问目前不暴露选项切换接口。
     * @returns {object} 选项键值对
     */
    getOptions() {
        return {
            webAccess: null,
            longThought: null
        };
    }

    /**
     * @description 获取模型版本列表。千问当前不暴露模型选择接口。
     * @returns {Array} 空数组
     */
    getModelVersionList() {
        return [];
    }

    /**
     * @description 获取当前模型版本。从回答内容中解析模型名称前缀。
     * @returns {string} 当前模型版本
     */
    getCurrentModelVersion() {
        // 从最后一个回答的前缀文字中提取模型名称
        const answers = this.elementAnswers();
        if (answers.length > 0) {
            const lastAnswer = answers[answers.length - 1];
            const text = lastAnswer.textContent?.trim() || '';
            // 回答内容以模型名开头，如 "Qwen3.5-Plus03月07日 21:02..."
            const match = text.match(/^(Qwen\d*(?:\.\d+)?(?:-[A-Za-z]+)?)/);
            if (match) {
                return match[1];
            }
        }
        return '';
    }
}

registerDriver(QianwenPageDriver, 'Qianwen', 'https://www.qianwen.com/chat', ['qianwen.com', 'www.qianwen.com']);

module.exports = {
    QianwenPageDriver
};
