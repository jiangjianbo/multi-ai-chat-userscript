const MULTI_AI_CHAT_MAIN_WINDOW = 'multi-ai-chat-main-window';

const Util = require('../src/util');
const Storage = require('../src/storage');
const Config = require('../src/config');
const I18n = require('../src/i18n');
//const Message = require('../src/message');
const Message = require('../tests/mock-message');

const { KimiPageDriver, GeminiPageDriver, ChatGPTPageDriver, GenericPageDriver } = require('../src/page-driver');
const DriverFactory = require('../src/driver-factory');
const ChatArea = require('../src/chat-area');

const MainWindowController = require('../src/main-window-controller');
const lang = require('../src/lang');

const util = new Util(); /* PageDriver要用到 */
const storage = new Storage();
const defaultConfig = {channelName: 'multi-ai-chat' };
const config = new Config(storage, defaultConfig);
const i18n = new I18n(config, lang);
const message = new Message(config.get('channelName'));

const mainWindowController = new MainWindowController(MULTI_AI_CHAT_MAIN_WINDOW, message, config, i18n);
mainWindowController.init();

console.log("Main window script loaded.");
