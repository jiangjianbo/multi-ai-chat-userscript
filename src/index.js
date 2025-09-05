import InjectionController from './injection-controller.js';
import MainWindowController from './main-window-controller.js';
import ChatArea from './chat-area.js';
import Utils from './utils.js';
import I18n from './i18n.js';
import MessageNotifier from './message-notifier.js';

const CHANNEL_NAME = 'multi-ai-chat-channel';
const WINDOW_NAME = 'multi-ai-sync-chat-window';

/**
 * 主函数，根据当前页面类型初始化不同的控制器
 */
function main() {
    // 将所有类附加到window对象，以便在注入的脚本中可以访问
    window.MultiAIChat = {
        MainWindowController,
        ChatArea,
        Utils,
        I18n,
        MessageNotifier,
        CHANNEL_NAME,
        WINDOW_NAME
    };

    // 检查是否为主窗口
    if (window.name === WINDOW_NAME) {
        const mainController = new window.MultiAIChat.MainWindowController();
        mainController.init();
    } else {
        // 原生AI页面，初始化注入控制器
        const controller = new InjectionController();
        controller.init();
    }
}

// 延迟3秒执行主函数
setTimeout(main, 3000);