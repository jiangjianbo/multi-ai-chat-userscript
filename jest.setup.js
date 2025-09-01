/* eslint-disable no-undef */
import 'jest-fetch-mock';   // 如脚本内用 fetch
import 'jest-location-mock';// 如脚本内用 location

// 1. 最常用的 GM_* 方法
global.GM_setValue = jest.fn();
global.GM_getValue = jest.fn((key, defaultVal) => defaultVal);
global.GM_deleteValue = jest.fn();
global.GM_xmlhttpRequest = jest.fn((opts) => {
    // 简单 mock：立即执行 onload
    setTimeout(() => opts.onload({ status: 200, responseText: '{}' }), 0);
    return { abort: jest.fn() };
});

// 2. 其他常见 API，按需添加
global.GM_addStyle = jest.fn();
global.GM_notification = jest.fn();
global.GM_info = {
    script: { name: 'multi-ai-sync-chat', version: '0.0.0-test' },
    scriptHandler: 'Jest'
};

// 3. 如果你的代码把功能挂到 window 上，可以预置一个空对象
window.MultiAISyncChat = {};
