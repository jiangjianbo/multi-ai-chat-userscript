





const CHANNEL_NAME = 'multi-ai-chat-channel';
const WINDOW_NAME = 'multi-ai-sync-chat-window';



/**
 * 主函数，根据当前页面类型初始化不同的控制器
 */
function main() {
    // 检查是否为主窗口
    if (window.name === WINDOW_NAME) {
        return; // 主窗口内容在打开时注入
    }

    // 原生AI页面，初始化注入控制器
    const controller = new InjectionController();
    controller.init();
}

// 延迟3秒执行主函数
setTimeout(main, 3000);
