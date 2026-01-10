// 根据项目规范，使用 function 定义构造函数来模拟类，并导出
class Util {
    /**
     * @description 在文档加载完成之后延迟运行。
     * @param {function} fn - 回调函数
     * @param {int} delay - 延迟的毫秒，默认5秒
     * @returns {HTMLElement} - 创建的 HTML 元素。
     */
    documentReady(fn, delay = 5000){
        // 确保页面加载完成后再执行初始化
        if (document.readyState === 'complete') {
            setTimeout(fn, delay);
        } else {
            window.addEventListener('load', () => {
                // 延迟5秒后执行初始化
                setTimeout(fn, delay);
            });
        }
        
    }

    /**
     * @description 根据 JSON 对象创建 HTML 元素。
     * @param {object} json - 描述 HTML 结构的 JSON 对象。
     * @returns {HTMLElement} - 创建的 HTML 元素。
     */
    toHtml(json) {
        if (typeof json === 'string') {
            return document.createTextNode(json);
        }

        let { tag, text, innerHTML, children, child, ...attrs } = json;

        // 处理简写形式, e.g., { div: 'hello', '@id': 'my-div' }
        if (!tag) {
            const firstKey = Object.keys(json)[0];
            if (firstKey && !['@', 'on', 'text', 'innerHTML', 'children', 'child'].some(prefix => firstKey.startsWith(prefix))) {
                tag = firstKey;
                text = json[tag];
                delete attrs[tag];
                if (children || child) {
                    throw new Error('Shorthand tag format cannot have children.');
                }
            }
        }

        if (!tag) {
            throw new Error('JSON object must have a "tag" property or a shorthand tag.');
        }

        const element = document.createElement(tag);

        if (innerHTML) {
            element.innerHTML = innerHTML;
        } else if (text) {
            if (tag.toLowerCase() === 'script' && typeof text === 'function') {
                element.textContent = text.toString();
            } else {
                element.textContent = text;
            }
        }

        for (const key in attrs) {
            if (key.startsWith('@')) {
                const attrName = key.substring(1);
                let attrValue = attrs[key];
                if (typeof attrValue === 'object' && attrValue !== null) {
                    attrValue = Object.entries(attrValue)
                        .map(([k, v]) => `${k}:${v}`)
                        .join(';');
                }
                element.setAttribute(attrName, attrValue);
            } else if (key.startsWith('on')) {
                const eventName = key.toLowerCase();
                let eventFunc = attrs[key];
                if (typeof eventFunc === 'function') {
                    eventFunc = `(${eventFunc.toString()})()`;
                }
                element.setAttribute(eventName, eventFunc);
            }
        }

        const childNodes = children || child;
        if (childNodes) {
            if (Array.isArray(childNodes)) {
                childNodes.forEach(childJson => {
                    element.appendChild(this.toHtml(childJson));
                });
            } else {
                element.appendChild(this.toHtml(childNodes));
            }
        }

        return element;
    }

    /**
     * @description 查询并返回匹配选择器的第一个 DOM 元素。
     * @param {string} selector - CSS 选择器。
     * @param {HTMLElement|Document} [parent=document] - 查询的父节点。
     * @returns {HTMLElement|null}
     */
    $(selector, parent = document) {
        if (selector == null || selector === '') {
            return null;
        }
        return parent.querySelector(selector);
    }

    /**
     * @description 查询并返回匹配选择器的所有 DOM 元素组成的 NodeList。
     * @param {string} selector - CSS 选择器。
     * @param {HTMLElement|Document} [parent=document] - 查询的父节点。
     * @returns {NodeListOf<HTMLElement>}
     */
    $$(selector, parent = document) {
        if (selector == null || selector === '') {
            return [];
        }
        return parent.querySelectorAll(selector);
    }
    
    /**
     * 遍历对象的所有成员，包括自有属性和继承属性
     * @param {object} obj 需要遍历的目标对象或Map
     * @param {function(obj, name, value)} callback 回调函数，参数为对象、属性名、属性值 
     * @returns 如果callback返回false或抛出异常则中断遍历
     */
    forEachMember(obj, callback) {
        const seenKeys = new Set();

        function iterate(currentObj) {
            // 遍历对象及其原型链上的所有自有属性
            while (currentObj != null && !seenKeys.has(currentObj)) {
                seenKeys.add(currentObj);

                const keys = Reflect.ownKeys(currentObj);
                for (const key of keys) {
                    if (seenKeys.has(key)) continue;

                    try {
                        const value = obj[key];
                        if (callback(obj, key, value) === false) {
                            return true;
                        }
                    } catch (e) {
                        // 如果回调抛出异常，中断迭代
                        return true;
                    }
                }

                currentObj = Object.getPrototypeOf(currentObj);
            }

            return false;
        }

        // 遍历对象及其原型链
        if (iterate(obj)) return;

        // 特殊处理 Map 对象，遍历其键值对
        if (obj instanceof Map) {
            for (const [key, value] of obj.entries()) {
                if (seenKeys.has(key)) continue;

                try {
                    if (callback(obj, key, value) === false) {
                        return;
                    }
                } catch (e) {
                    // 如果回调抛出异常，中断迭代
                    return;
                }
            }
        }
    }

    /**
     * @description 模拟点击元素，然后在两次点击之间调用某个函数回调
     * @param {function} callback - a function to get the content
     * @returns {Promise<any>} - the content
     */
    async clickAndGet(clickElement, callback) {
        clickElement.click();
        await new Promise(resolve => setTimeout(resolve, 200));
        const result = callback();
        clickElement.click();
            return result;
    }

    /**
     * @description 获取HTML元素的内容或值，根据元素类型返回正确的数据类型。
     * @param {HTMLElement} element - 要获取内容的HTML元素。
     * @returns {*} - 元素的内容或值，类型根据元素类型而定（例如，checkbox返回boolean，input返回string）。
     */
    getText(element) {
        if (!element) {
            return undefined;
        }

        const tagName = element.tagName.toLowerCase();
        const type = element.type ? element.type.toLowerCase() : '';

        if (tagName === 'input') {
            if (type === 'checkbox' || type === 'radio') {
                return element.checked;
            }
            return element.value;
        } else if (tagName === 'textarea' || tagName === 'select') {
            return element.value;
        } else {
            // For other elements like div, span, p, etc.
            return element.textContent;
        }
    }

    /**
     * @description 设置HTML元素的内容或值，根据元素类型接受正确的数据类型。
     * @param {HTMLElement} element - 要设置内容的HTML元素。
     * @param {*} value - 要设置的值，类型根据元素类型而定（例如，checkbox接受boolean，input接受string）。
     */
    setText(element, value) {
        if (!element) {
            return;
        }

        const tagName = element.tagName.toLowerCase();
        const type = element.type ? element.type.toLowerCase() : '';

        if (tagName === 'input') {
            if (type === 'checkbox' || type === 'radio') {
                element.checked = !!value; // Ensure boolean
            } else {
                element.value = String(value); // Ensure string
            }
        } else if (tagName === 'textarea' || tagName === 'select') {
            element.value = String(value); // Ensure string
        } else {
            // For other elements like div, span, p, etc.
            element.textContent = String(value); // Ensure string
        }
    }

    /**
     * @description 模拟用户通过键盘输入文本到指定元素
     * @param {HTMLElement} element - 目标元素（input, textarea, 或 contenteditable 元素）
     * @param {string} text - 要输入的文本
     */
    simulateType(element, text) {
        if (!element) {
            console.warn('simulateType: element is null or undefined');
            return;
        }

        // 先聚焦元素
        element.focus();

        // 清空现有内容
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.value = '';
        } else if (element.isContentEditable) {
            element.innerHTML = '';
        }

        // 为每个字符模拟键盘输入事件
        const characters = text.split('');
        characters.forEach((char) => {
            // 创建并派发 keydown 事件
            const keydownEvent = new KeyboardEvent('keydown', {
                key: char,
                code: char === '\n' ? 'Enter' : `Key${char.toUpperCase()}`,
                keyCode: char.charCodeAt(0),
                which: char.charCodeAt(0),
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(keydownEvent);

            // 创建并派发 keypress 事件
            const keypressEvent = new KeyboardEvent('keypress', {
                key: char,
                keyCode: char.charCodeAt(0),
                which: char.charCodeAt(0),
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(keypressEvent);

            // 插入字符
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.value += char;
            } else if (element.isContentEditable) {
                element.textContent += char;
            }

            // 创建并派发 input 事件
            const inputEvent = new Event('input', {
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(inputEvent);

            // 创建并派发 keyup 事件
            const keyupEvent = new KeyboardEvent('keyup', {
                key: char,
                code: char === '\n' ? 'Enter' : `Key${char.toUpperCase()}`,
                keyCode: char.charCodeAt(0),
                which: char.charCodeAt(0),
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(keyupEvent);
        });
    }

    /**
     * @description 获取HTML元素的布尔值状态，主要用于checkbox或具有布尔语义的元素。
     * @param {HTMLElement} element - 要获取布尔值的HTML元素。
     * @returns {boolean|undefined} - 元素的布尔值状态，如果元素没有明确的布尔状态则返回undefined。
     */
    getBoolean(element) {
        if (!element) {
            return undefined;
        }

        const tagName = element.tagName.toLowerCase();
        const type = element.type ? element.type.toLowerCase() : '';

        if (tagName === 'input' && (type === 'checkbox' || type === 'radio')) {
            return element.checked;
        }
        // For other elements, if they have a 'data-checked' or similar attribute,
        // or if their text content can be parsed as boolean,
        // this can be extended. For now, focus on standard boolean inputs.
        return undefined;
    }  

    /**
     * 获取函数对象的名称
     * @param {Function} func 对象
     * @returns {string|null} 函数名称，若无法获取则返回 null
     */
    getFunctionName(func) {
        if (typeof func !== 'function') {
            return null;
        }
        return func.name || func.toString().match(/function ([^\(]+)/)[1];
    }

    /**
     * 将特殊字符转换为 HTML 实体，防止 XSS 攻击
     * @param {string} unsafe 呆html的字符串
     * @returns {string} 转义后的HTML字符串
     */
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * 将 JSON 对象转换为安全的字符串，防止 XSS 攻击
     * @param {*} jsonObj json对象
     * @returns {string} 安全的字符串，使用JSON.parse可以还原
     */
    safeJsonString(jsonObj) {
        return JSON.stringify(jsonObj)
            .replace(/</g, '\\u003c')  // 转义 <
            .replace(/>/g, '\\u003e')  // 转义 >
            .replace(/&/g, '\\u0026')  // 转义 &
            .replace(/'/g, '\\u0027'); // 转义单引号
    }

    /**
     * @description 检测编辑器类型
     * @param {HTMLElement} element - 要检测的HTML元素
     * @returns {string} - 编辑器类型：'lexical', 'contenteditable', 'input', 'textarea', 'unknown'
     */
    detectEditorType(element) {
        if (!element) {
            return 'unknown';
        }

        // 检查是否为 Lexical 编辑器（通过 data-lexical-editor 属性）
        if (element.hasAttribute && element.hasAttribute('data-lexical-editor')) {
            return 'lexical';
        }

        // 检查是否为 contenteditable 元素
        if (element.isContentEditable) {
            return 'contenteditable';
        }

        // 检查是否为标准表单元素
        const tagName = element.tagName ? element.tagName.toLowerCase() : '';
        if (tagName === 'input') {
            return 'input';
        } else if (tagName === 'textarea') {
            return 'textarea';
        }

        return 'unknown';
    }

    /**
     * @description 设置 Lexical 编辑器的内容
     * @param {HTMLElement} element - Lexical 编辑器元素
     * @param {string} text - 要设置的文本内容
     */
    setLexicalContent(element, text) {
        if (!element) {
            console.warn('setLexicalContent: element is null or undefined');
            return;
        }

        // 清空现有内容
        element.innerHTML = '';

        // 创建 Lexical 编辑器的正确 DOM 结构
        const paragraph = document.createElement('p');
        paragraph.setAttribute('dir', 'ltr');

        const span = document.createElement('span');
        span.setAttribute('data-lexical-text', 'true');
        span.textContent = text;

        paragraph.appendChild(span);
        element.appendChild(paragraph);

        // 触发 input 事件通知编辑器内容已改变
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));

        // 尝试触发 Lexical 特有的事件
        element.dispatchEvent(new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            data: text
        }));
    }

    /**
     * 返回依赖库的源代码
     * @returns {string} 返回依赖库的源代码
     */
    safeString(str) {
        return str
            .replace(/\\/g, '\\\\')  // 先转义反斜杠
            .replace(/'/g, "\\'")    // 转义单引号
            .replace(/`/g, "'")      // 将反引号替换为单引号
            .replace(/\n/g, '\\n')   // 转义换行符
            .replace(/\r/g, '\\r')   // 转义回车符
            .replace(/\t/g, '\\t');  // 转义制表符
        ;
    }
}

module.exports = Util;
