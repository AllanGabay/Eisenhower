const assert = require('assert');

function isTaskUrgent(dueDate){
  if(!dueDate) return false;
  const today = new Date();
  today.setHours(0,0,0,0);
  const taskDate = new Date(dueDate);
  taskDate.setHours(0,0,0,0);
  return taskDate <= today || (taskDate.getTime() - today.getTime()) <= 24*60*60*1000;
}

function calculateQuadrant(priority, dueDate){
  const isImportant = priority === 'high' || priority === 'medium';
  const isUrgent = isTaskUrgent(dueDate);
  if(isImportant && isUrgent) return 1;
  if(isImportant && !isUrgent) return 2;
  if(!isImportant && isUrgent) return 3;
  return 4;
}

const now = new Date().toISOString();
assert.strictEqual(calculateQuadrant('high', now), 1);
const future = new Date(Date.now()+7*24*3600*1000).toISOString();
assert.strictEqual(calculateQuadrant('high', future), 2);
assert.strictEqual(calculateQuadrant('low', future), 4);

// Test HTML description is not interpreted as code
const fs = require('fs');
const vm = require('vm');
const path = require('path');

class Element {
  constructor(tag) {
    this.tagName = tag;
    this.children = [];
    this.attributes = {};
    this._classList = [];
    this.classList = {
      add: (...cls) => {
        cls.forEach(c => { if (!this._classList.includes(c)) this._classList.push(c); });
      },
      remove: (...cls) => {
        this._classList = this._classList.filter(c => !cls.includes(c));
      },
      contains: c => this._classList.includes(c)
    };
    Object.defineProperty(this, 'className', {
      get: () => this._classList.join(' '),
      set: v => { this._classList = v.split(/\s+/).filter(Boolean); }
    });
    this.textContent = '';
  }
  appendChild(c) { this.children.push(c); }
  setAttribute(k, v) { this.attributes[k] = v; }
  addEventListener() {}
  _findByClass(node, cls) {
    if (node.classList.contains(cls)) return node;
    for (const child of node.children) {
      const res = this._findByClass(child, cls);
      if (res) return res;
    }
    return null;
  }
  querySelector(sel) {
    if (sel.startsWith('.')) return this._findByClass(this, sel.slice(1));
    return null;
  }
  get innerHTML() {
    let html = '';
    if (this.textContent) html += escapeHTML(this.textContent);
    for (const child of this.children) html += child.outerHTML;
    return html;
  }
  get outerHTML() {
    const attrs = [];
    const cls = this.className;
    if (cls) attrs.push(`class="${cls}"`);
    for (const [k, v] of Object.entries(this.attributes)) attrs.push(`${k}="${v}"`);
    return `<${this.tagName}${attrs.length ? ' ' + attrs.join(' ') : ''}>${this.innerHTML}</${this.tagName}>`;
  }
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const document = { createElement: t => new Element(t) };

let code = fs.readFileSync(path.join(__dirname, '../ui.js'), 'utf8');
code = code.replace(/export /g, '');
const sandbox = { document };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const createTaskCard = sandbox.createTaskCard;

const htmlDesc = '<b>Important</b>';
const task = {
  id: '1',
  title: 'Test',
  description: htmlDesc,
  dueDate: null,
  priority: 'low',
  category: null,
  recurrence: null,
  quadrant: 1,
  createdAt: new Date().toISOString()
};

const card = createTaskCard(task, { onEdit() {}, onDelete() {} });
const descElem = card.querySelector('.text-sm');
assert(descElem, 'Description element should exist');
assert.strictEqual(descElem.textContent, htmlDesc);
assert.strictEqual(descElem.innerHTML, '&lt;b&gt;Important&lt;/b&gt;');

console.log('All tests passed');
