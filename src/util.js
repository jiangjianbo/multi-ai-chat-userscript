// 根据项目规范，使用 function 定义构造函数来模拟类，并导出
function Util() {
    /**
     * @description 在文档加载完成之后延迟运行。
     * @param {function} fn - 回调函数
     * @param {int} delay - 延迟的毫秒，默认5秒
     * @returns {HTMLElement} - 创建的 HTML 元素。
     */
    this.documentReady = function(fn, delay = 5000){
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
    this.toHtml = function toHtml(json) {
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
                    element.appendChild(toHtml(childJson));
                });
            } else {
                element.appendChild(toHtml(childNodes));
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
    this.$ = function(selector, parent = document) {
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
    this.$$ = function(selector, parent = document) {
        if (selector == null || selector === '') {
            return [];
        }
        return parent.querySelectorAll(selector);
    }
    
    /**
     * @description 模拟点击元素，然后在两次点击之间调用某个函数回调
     * @param {function} callback - a function to get the content
     * @returns {Promise<any>} - the content
     */
    this.clickAndGet = async function(clickElement, callback) {
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
    this.getText = function(element) {
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
    this.setText = function(element, value) {
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
     * @description 获取HTML元素的布尔值状态，主要用于checkbox或具有布尔语义的元素。
     * @param {HTMLElement} element - 要获取布尔值的HTML元素。
     * @returns {boolean|undefined} - 元素的布尔值状态，如果元素没有明确的布尔状态则返回undefined。
     */
    this.getBoolean = function(element) {
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
}

module.exports = Util;