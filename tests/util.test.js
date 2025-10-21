const Util = require('../src/util');
const util = new Util();

// JSDOM a-là Jest会提供 document 对象

describe('Util.toHtml', () => {

    test('1.1: should convert a simple json to an element', () => {
        const el = util.toHtml({ tag: 'div', text: 'hello' });
        expect(el.tagName).toBe('DIV');
        expect(el.textContent).toBe('hello');
    });

    test('1.2: should set an attribute', () => {
        const el = util.toHtml({ tag: 'div', '@id': 'id1', text: 'hello' });
        expect(el.id).toBe('id1');
    });

    test('1.3: should set a single style property', () => {
        const el = util.toHtml({ tag: 'div', '@style': { border: '1px' }, text: 'hello' });
        expect(el.style.border).toBe('1px');
    });

    test('1.4: should set multiple style properties', () => {
        const el = util.toHtml({ tag: 'div', '@style': { border: '1px', color: 'red' }, text: 'hello' });
        expect(el.style.border).toBe('1px');
        expect(el.style.color).toBe('red');
    });

    test('1.5: should handle shorthand tag format', () => {
        const el = util.toHtml({ div: 'hello' });
        expect(el.tagName).toBe('DIV');
        expect(el.textContent).toBe('hello');
    });

    test('1.6: should handle shorthand tag format with attributes', () => {
        const el = util.toHtml({ div: 'hello', '@id': 'id2' });
        expect(el.id).toBe('id2');
        expect(el.textContent).toBe('hello');
    });

    test('1.7: should handle nested children', () => {
        const el = util.toHtml({ tag: 'div', text: 'hello', child: [{ span: 'world' }] });
        expect(el.textContent).toBe('helloworld');
        expect(el.children.length).toBe(1);
        expect(el.children[0].tagName).toBe('SPAN');
    });

    test('1.8: should throw an error for invalid shorthand format with children', () => {
        expect(() => {
            util.toHtml({ div: 'hello', child: [{ span: 'world' }] });
        }).toThrow('Shorthand tag format cannot have children.');
    });

    test('1.9: should handle script tag with a function', () => {
        function abc() { console.log("1"); }
        const el = util.toHtml({ tag: 'script', text: abc });
        expect(el.tagName).toBe('SCRIPT');
        const expectedText = 'function abc() { console.log("1"); }';
        expect(el.textContent.replace(/\s/g, '')).toBe(expectedText.replace(/\s/g, ''));
    });

    test('1.10: should handle shorthand script tag with a function', () => {
        function abc() { console.log("1"); }
        const el = util.toHtml({ script: abc });
        expect(el.tagName).toBe('SCRIPT');
        const expectedText = 'function abc() { console.log("1"); }';
        expect(el.textContent.replace(/\s/g, '')).toBe(expectedText.replace(/\s/g, ''));
    });

    test('1.11: should set innerHTML correctly', () => {
        const el = util.toHtml({ tag: 'div', innerHTML: '<span>Hello</span>' });
        expect(el.children.length).toBe(1);
        expect(el.children[0].tagName).toBe('SPAN');
        expect(el.textContent).toBe('Hello');
    });
});

describe('Util DOM operations', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="container">
                <span class="item">A</span>
                <span class="item">B</span>
                <p>C</p>
            </div>
        `;
    });

    test('$: should select the first element', () => {
        const el = util.$('.item');
        expect(el).not.toBeNull();
        expect(el.textContent).toBe('A');
    });

    test('$: should return null if no element is found', () => {
        const el = util.$('.non-existent');
        expect(el).toBeNull();
    });

    test('$$: should select all matching elements', () => {
        const elements = util.$$('.item');
        expect(elements.length).toBe(2);
        expect(elements[0].textContent).toBe('A');
        expect(elements[1].textContent).toBe('B');
    });

    test('$$: should return an empty NodeList if no elements are found', () => {
        const elements = util.$$('.non-existent');
        expect(elements.length).toBe(0);
    });

    test('$: should search within a parent element', () => {
        const container = util.$('#container');
        const p = util.$('p', container);
        expect(p).not.toBeNull();
        expect(p.textContent).toBe('C');
    });
});


describe('util.getText', () => {
    let inputElement, textareaElement, selectElement, divElement, checkboxElement, radioElement;

    beforeEach(() => {
        // Mock DOM elements
        inputElement = document.createElement('input');
        textareaElement = document.createElement('textarea');
        selectElement = document.createElement('select');
        divElement = document.createElement('div');
        checkboxElement = document.createElement('input');
        checkboxElement.type = 'checkbox';
        radioElement = document.createElement('input');
        radioElement.type = 'radio';
    });

    test('should get value from text input', () => {
        inputElement.value = 'test input';
        expect(util.getText(inputElement)).toBe('test input');
    });

    test('should get value from textarea', () => {
        textareaElement.value = 'test textarea';
        expect(util.getText(textareaElement)).toBe('test textarea');
    });

    test('should get value from select', () => {
        const option1 = document.createElement('option');
        option1.value = 'option1';
        option1.textContent = 'Option 1';
        selectElement.appendChild(option1);
        selectElement.value = 'option1';
        expect(util.getText(selectElement)).toBe('option1');
    });

    test('should get textContent from div', () => {
        divElement.textContent = 'test div';
        expect(util.getText(divElement)).toBe('test div');
    });

    test('should get checked state from checkbox', () => {
        checkboxElement.checked = true;
        expect(util.getText(checkboxElement)).toBe(true);
        checkboxElement.checked = false;
        expect(util.getText(checkboxElement)).toBe(false);
    });

    test('should get checked state from radio button', () => {
        radioElement.checked = true;
        expect(util.getText(radioElement)).toBe(true);
        radioElement.checked = false;
        expect(util.getText(radioElement)).toBe(false);
    });

    test('should return undefined for null element', () => {
        expect(util.getText(null)).toBeUndefined();
    });
});

describe('util.setText', () => {
    let inputElement, textareaElement, selectElement, divElement, checkboxElement, radioElement;

    beforeEach(() => {
        // Mock DOM elements
        inputElement = document.createElement('input');
        textareaElement = document.createElement('textarea');
        selectElement = document.createElement('select');
        divElement = document.createElement('div');
        checkboxElement = document.createElement('input');
        checkboxElement.type = 'checkbox';
        radioElement = document.createElement('input');
        radioElement.type = 'radio';
    });

    test('should set value for text input', () => {
        util.setText(inputElement, 'new input value');
        expect(inputElement.value).toBe('new input value');
    });

    test('should set value for textarea', () => {
        util.setText(textareaElement, 'new textarea value');
        expect(textareaElement.value).toBe('new textarea value');
    });

    test('should set value for select', () => {
        const option1 = document.createElement('option');
        option1.value = 'option1';
        selectElement.appendChild(option1);
        util.setText(selectElement, 'option1');
        expect(selectElement.value).toBe('option1');
    });

    test('should set textContent for div', () => {
        util.setText(divElement, 'new div content');
        expect(divElement.textContent).toBe('new div content');
    });

    test('should set checked state for checkbox', () => {
        util.setText(checkboxElement, true);
        expect(checkboxElement.checked).toBe(true);
        util.setText(checkboxElement, false);
        expect(checkboxElement.checked).toBe(false);
    });

    test('should set checked state for radio button', () => {
        util.setText(radioElement, true);
        expect(radioElement.checked).toBe(true);
        util.setText(radioElement, false);
        expect(radioElement.checked).toBe(false);
    });

    test('should handle non-boolean values for checkbox/radio', () => {
        util.setText(checkboxElement, 1);
        expect(checkboxElement.checked).toBe(true);
        util.setText(checkboxElement, 0);
        expect(checkboxElement.checked).toBe(false);
        util.setText(checkboxElement, 'true');
        expect(checkboxElement.checked).toBe(true);
        util.setText(checkboxElement, '');
        expect(checkboxElement.checked).toBe(false);
    });

    test('should not throw error for null element', () => {
        expect(() => util.setText(null, 'value')).not.toThrow();
    });
});

describe('util.getBoolean', () => {
    let checkboxElement, radioElement, inputElement, divElement;

    beforeEach(() => {
        checkboxElement = document.createElement('input');
        checkboxElement.type = 'checkbox';
        radioElement = document.createElement('input');
        radioElement.type = 'radio';
        inputElement = document.createElement('input');
        divElement = document.createElement('div');
    });

    test('should return true for checked checkbox', () => {
        checkboxElement.checked = true;
        expect(util.getBoolean(checkboxElement)).toBe(true);
    });

    test('should return false for unchecked checkbox', () => {
        checkboxElement.checked = false;
        expect(util.getBoolean(checkboxElement)).toBe(false);
    });

    test('should return true for checked radio button', () => {
        radioElement.checked = true;
        expect(util.getBoolean(radioElement)).toBe(true);
    });

    test('should return false for unchecked radio button', () => {
        radioElement.checked = false;
        expect(util.getBoolean(radioElement)).toBe(false);
    });

    test('should return undefined for non-checkbox/radio input', () => {
        inputElement.value = 'some text';
        expect(util.getBoolean(inputElement)).toBeUndefined();
    });

    test('should return undefined for non-input elements', () => {
        divElement.textContent = 'true';
        expect(util.getBoolean(divElement)).toBeUndefined();
    });

    test('should return undefined for null element', () => {
        expect(util.getBoolean(null)).toBeUndefined();
    });
});

