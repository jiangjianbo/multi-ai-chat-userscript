/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import MainWindowController from '../src/main-window-controller';

describe('MainWindowController', () => {
    beforeEach(() => {
        // 1. 把 HTML 读进来并塞进 jsdom
        const html = readFileSync(resolve(__dirname, 'main4debug.html'), 'utf8');
        document.documentElement.innerHTML = html;
    });

    it('should update #output when button is clicked', () => {
        // 2. 实例化类，它会自动绑定事件
        const mainWin = new MainWindowController();

        mainWin.init();
        // 4. 断言
        
    });
});