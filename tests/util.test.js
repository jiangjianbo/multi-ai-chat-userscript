const Util = require('../src/util');

// JSDOM a-là Jest会提供 document 对象

describe('Util.toHtml', () => {

    test('1.1: should convert a simple json to an element', () => {
        const el = Util.toHtml({ tag: 'div', text: 'hello' });
        expect(el.tagName).toBe('DIV');
        expect(el.textContent).toBe('hello');
        expect(el.outerHTML).toBe('<div>hello</div>');
    });

    test('1.2: should set an attribute', () => {
        const el = Util.toHtml({ tag: 'div', '@id': 'id1', text: 'hello' });
        expect(el.id).toBe('id1');
        expect(el.outerHTML).toBe('<div id="id1">hello</div>');
    });

    test('1.3: should set a single style property', () => {
        const el = Util.toHtml({ tag: 'div', '@style': { border: '1px' }, text: 'hello' });
        expect(el.style.border).toBe('1px');
        expect(el.outerHTML).toBe('<div style="border: 1px;">hello</div>');
    });

    test('1.4: should set multiple style properties', () => {
        const el = Util.toHtml({ tag: 'div', '@style': { border: '1px', color: 'red' }, text: 'hello' });
        expect(el.style.border).toBe('1px');
        expect(el.style.color).toBe('red');
        expect(el.outerHTML).toBe('<div style="border: 1px; color: red;">hello</div>');
    });

    test('1.5: should handle shorthand tag format', () => {
        const el = Util.toHtml({ div: 'hello' });
        expect(el.tagName).toBe('DIV');
        expect(el.textContent).toBe('hello');
        expect(el.outerHTML).toBe('<div>hello</div>');
    });

    test('1.6: should handle shorthand tag format with attributes', () => {
        const el = Util.toHtml({ div: 'hello', '@id': 'id2' });
        expect(el.id).toBe('id2');
        expect(el.textContent).toBe('hello');
        expect(el.outerHTML).toBe('<div id="id2">hello</div>');
    });

    test('1.7: should handle nested children', () => {
        const el = Util.toHtml({ tag: 'div', text: 'hello', child: [{ span: 'world' }] });
        expect(el.textContent).toBe('helloworld');
        expect(el.children.length).toBe(1);
        expect(el.children[0].tagName).toBe('SPAN');
        expect(el.outerHTML).toBe('<div>hello<span>world</span></div>');
    });

    test('1.8: should throw an error for invalid shorthand format with children', () => {
        expect(() => {
            Util.toHtml({ div: 'hello', child: [{ span: 'world' }] });
        }).toThrow('Shorthand tag format cannot have children.');
    });

    test('1.9: should handle script tag with a function', () => {
        function abc() { console.log("1"); }
        const el = Util.toHtml({ tag: 'script', text: abc });
        expect(el.tagName).toBe('SCRIPT');
        expect(el.textContent).toBe('function abc() { console.log("1"); }');
    });

    test('1.10: should handle shorthand script tag with a function', () => {
        function abc() { console.log("1"); }
        const el = Util.toHtml({ script: abc });
        expect(el.tagName).toBe('SCRIPT');
        expect(el.textContent).toBe('function abc() { console.log("1"); }');
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
        const el = Util.$('.item');
        expect(el).not.toBeNull();
        expect(el.textContent).toBe('A');
    });

    test('$: should return null if no element is found', () => {
        const el = Util.$('.non-existent');
        expect(el).toBeNull();
    });

    test('$$: should select all matching elements', () => {
        const elements = Util.$$('.item');
        expect(elements.length).toBe(2);
        expect(elements[0].textContent).toBe('A');
        expect(elements[1].textContent).toBe('B');
    });

    test('$$: should return an empty NodeList if no elements are found', () => {
        const elements = Util.$$('.non-existent');
        expect(elements.length).toBe(0);
    });

    test('$: should search within a parent element', () => {
        const container = Util.$('#container');
        const p = Util.$('p', container);
        expect(p).not.toBeNull();
        expect(p.textContent).toBe('C');
    });
});
