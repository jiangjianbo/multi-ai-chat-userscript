const Storage = require('./storage');
const Config = require('./config');
const I18n = require('./i18n');
const Message = require('./message');
const PageController = require('./page-controller');
const Util = require('./util');

(function() {
    'use strict';

    // Ensure the script runs after the page is fully loaded
    window.addEventListener('load', () => {
        // 1. Initialize core services (singletons for this page context)
        const storage = new Storage('multi-ai-chat-');
        
        const config = new Config({
            storage: storage,
            defaultConfig: {
                layout: 2,
                // Add other default configurations here
            }
        });

        const i18n = new I18n({ config });

        const message = new Message('multi-ai-sync-chat-channel');

        // 2. Initialize the main controller for the page
        const pageController = new PageController({
            message: message,
            config: config,
            i18n: i18n,
            util: Util
        });

        // 3. Start the application logic on the page
        try {
            pageController.init();
        } catch (e) {
            console.error('[Multi-AI Sync Chat] Initialization failed:', e);
        }
    });
})();
