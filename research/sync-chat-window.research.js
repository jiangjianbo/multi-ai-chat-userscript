const Util = require('../src/util');
const I18n = require('../src/i18n');
const Config = require('../src/config');
const Storage = require('../src/storage');
const Message = require('../src/message');
const ChatArea = require('../src/chat-area');
const MainWindowController = require('../src/main-window-controller');
const lang = require('../src/lang');
const SyncChatWindow = require('../src/sync-chat-window');


// 初始化
const storage = new Storage();
const defaultConfig = { channelName: 'multi-ai-chat' };
const config = new Config(storage, defaultConfig);
const i18n = new I18n(config, lang);
const message = new Message(config.get('channelName'));

const chatWindow = new SyncChatWindow();
chatWindow.createWindow(window.document, true);

const mainWindowController = new MainWindowController(chatWindow.MULTI_AI_CHAT_MAIN_WINDOW, message, config, i18n);
mainWindowController.init();

const url = 'https://api.example.com/ai-chat';
const container = mainWindowController.chatAreaContainer;

mainWindowController.addChatArea({ id: 'chat-area-1', providerName: 'ChatGPT', url: 'https://chatgpt.com', pinned: false, params: { webAccess: true, models: ['gpt', 'abc'] }});
mainWindowController.addChatArea({ id: 'chat-area-2', providerName: 'Gemini', url: 'https://gemini.google.com', pinned: true, params: { webAccess: false, models: ['gemini'] }, conversation: [{ type: 'question', content: 'abc' }, { type:'answer', content:'cdef'}]});
mainWindowController.addChatArea({ id: 'chat-area-3', providerName: 'kimi K1', pinned: false, params: { webAccess: true, models: ['kimi K1', 'kimi'] }, conversation: [{ type: 'question', content: 'abc' }, { type:'answer', content:'this is a answer'}]});



