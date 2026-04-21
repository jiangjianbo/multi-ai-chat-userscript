// 不 mock driver-factory，让它真正注册 Qianwen 驱动
const { DriverFactory } = require('../src/driver-factory');
const { GenericPageDriver } = require('../src/page-driver');
const { QianwenPageDriver } = require('../src/qianwen-page-driver');

const driverFactory = new DriverFactory();

// Mock qianwen chat page DOM
// 注意：jsdom 不支持 :has() 和复杂的 $= 属性选择器，
// 所以在测试中用简化的选择器替代，仅测试驱动逻辑
const originalSelectors = {};

// 保存原始选择器并替换为 jsdom 兼容的版本
const setupDOM = () => {
    document.body.innerHTML = `
        <div id="qianwen-main-area"></div>
        <aside class="bg-pc-sidebar">
            <div class="sider-scrollbar">
                <div class="mb-0.5 pl-3 pr-1.5">
                    <div class="group relative flex justify-between py-[0.375rem] pl-3 items-center cursor-pointer" style="background-color: rgba(6, 10, 38, 0.03);">
                        <div class="text-ellipsis whitespace-nowrap overflow-hidden text-base-secondary text-primary">SQL Server 连接问题</div>
                    </div>
                </div>
                <div class="mb-0.5 pl-3 pr-1.5">
                    <div class="group relative flex justify-between py-[0.375rem] pl-3 items-center cursor-pointer" style="">
                        <div class="text-ellipsis whitespace-nowrap overflow-hidden text-base-secondary text-primary">历史对话2</div>
                    </div>
                </div>
            </div>
            <button>
                <span data-icon-type="qwpcicon-newDialogue" class="size-4"></span>
                新建对话
            </button>
        </aside>
        <div class="message-list-scroll-container">
            <div class="scrollOutWrapper-abc123">
                <div>
                    <div class="questionItem-u8_ahH group" data-msgid="q1">
                        <div></div>
                        <div>
                            <div class="content-hKtCkw">
                                <div><div>如何检查 SQL Server 连接？</div></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="answerItem-sQ6QT6 true quark" data-msgid="q1-answer">
                        <div></div>
                        <div></div>
                        <div>
                            <div class="containerWrap-x0TwX5">
                                <div class="content-MqQgCb">Qwen3.5-Plus03月07日 21:02这是关于 SQL Server 连接的解答...</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="questionItem-u8_ahH group" data-msgid="q2">
                        <div></div>
                        <div>
                            <div class="content-hKtCkw">
                                <div><div>如何启用 TCP/IP？</div></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="answerItem-sQ6QT6 true quark" data-msgid="q2-answer">
                        <div></div>
                        <div></div>
                        <div>
                            <div class="containerWrap-x0TwX5">
                                <div class="content-MqQgCb">Qwen3.5-Plus03月07日 21:03要启用 TCP/IP，请按以下步骤操作...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div data-chat-input-bottom-bar="true">
            <div data-testid="chat-input-content-measure">
                <div class="relative w-full">
                    <div contenteditable="true" role="textbox" class="relative min-h-[24px]">
                        <p data-slate-node="element"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="n" data-slate-length="0">&nbsp;</span></span></span></p>
                    </div>
                </div>
            </div>
            <button aria-label="发送消息">
                <span data-role="icon" data-render-as="svg" data-icon-type="qwpcicon-sendChat"></span>
            </button>
        </div>
    `;
};

describe('QianwenPageDriver', () => {
    let driver;

    beforeEach(() => {
        setupDOM();
        driver = new QianwenPageDriver();
        // 替换 jsdom 不支持的选择器为兼容版本
        // answers 指向 answerItem 层级（getAnswer 在此元素内用 answer_result 查找内容）
        driver.selectors.questions = '[class*="questionItem"] [class*="content-"]';
        driver.selectors.answers = '[class*="answerItem"]';
        driver.selectors.sendButton = 'button[aria-label="发送消息"]';
    });

    test('1. should extend GenericPageDriver', () => {
        expect(driver).toBeInstanceOf(GenericPageDriver);
        expect(driver.providerName).toBe('Qianwen');
    });

    test('2. should have correct selectors', () => {
        expect(driver.selectors.promptInput).toBe('div[contenteditable="true"][role="textbox"]');
        expect(driver.selectors.conversationArea).toBe('.message-list-scroll-container');
    });

    test('3. should get conversation count', () => {
        expect(driver.getConversationCount()).toBe(2);
    });

    test('4. should get question text from content container', () => {
        expect(driver.getQuestion(0)).toBe('如何检查 SQL Server 连接？');
        expect(driver.getQuestion(1)).toBe('如何启用 TCP/IP？');
    });

    test('5. should get answer content', () => {
        const answer = driver.getAnswer(0);
        expect(answer.result).toContain('SQL Server 连接的解答');
    });

    test('6. should get chat title from sidebar selected item', () => {
        expect(driver.getChatTitle()).toBe('SQL Server 连接问题');
    });

    test('7. should get history count', () => {
        expect(driver.getHistoryCount()).toBe(2);
    });

    test('8. should get conversations array', () => {
        const conversations = driver.getConversations();
        expect(conversations.length).toBe(4); // 2 questions + 2 answers
        expect(conversations[0].type).toBe('question');
        expect(conversations[0].content).toContain('SQL Server 连接');
        expect(conversations[1].type).toBe('answer');
    });

    test('9. should return provider name', () => {
        expect(driver.getProviderName()).toBe('Qianwen');
    });

    test('10. should detect Slate editor type', () => {
        const input = driver.elementPromptInput();
        const Util = require('../src/util');
        const util = new Util();
        expect(util.detectEditorType(input)).toBe('slate');
    });

    test('11. should set Slate content via setPrompt', () => {
        driver.setPrompt('测试消息');
        const input = driver.elementPromptInput();
        expect(input.textContent).toContain('测试消息');
    });

    test('12. should find send button', () => {
        const btn = driver.elementSendButton();
        expect(btn).not.toBeNull();
    });

    test('13. should find conversation area', () => {
        const area = driver.elementConversationArea();
        expect(area).not.toBeNull();
        expect(area.className).toContain('message-list-scroll-container');
    });

    test('14. should find new session button', () => {
        const btn = driver.elementNewSessionButton();
        expect(btn).not.toBeNull();
        expect(btn.textContent).toContain('新建对话');
    });

    test('15. should extract model version from answer prefix', () => {
        const version = driver.getCurrentModelVersion();
        expect(version).toBe('Qwen3.5-Plus');
    });

    test('16. should return empty options', () => {
        const options = driver.getOptions();
        expect(options.webAccess).toBeNull();
        expect(options.longThought).toBeNull();
    });

    test('17. should find sync button container', () => {
        const container = driver.elementSyncButtonContainer();
        expect(container).not.toBeNull();
        expect(container.id).toBe('qianwen-main-area');
    });

    describe('driverFactory integration', () => {
        test('should create QianwenPageDriver for qianwen.com', () => {
            const qDriver = driverFactory.createDriver('qianwen.com');
            expect(qDriver).toBeInstanceOf(GenericPageDriver);
        });

        test('should create QianwenPageDriver for www.qianwen.com', () => {
            const qDriver = driverFactory.createDriver('www.qianwen.com');
            expect(qDriver).toBeInstanceOf(GenericPageDriver);
        });
    });
});
