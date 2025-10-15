const MainWindowController = require('./sync-chat-window');
const PageController = require('./page-controller');

/**
 * @description The entry point of the userscript.
 * It determines whether the current page is the main window or a target chat page,
 * and initializes the corresponding controller.
 */
function main() {
    console.log('Multi AI Chat Userscript loaded.');

    // As per design/architect.md, window.name is used to identify the main window.
    if (window.name === 'multi-ai-chat-main-window') {
        console.log('Initializing MainWindowController...');
        const mainWindowController = new MainWindowController();
        mainWindowController.init();
    } else {
        console.log('Initializing PageController...');
        const pageController = new PageController();
        pageController.init();
    }
}

// Run the main function
main();