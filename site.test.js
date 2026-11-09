const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

test('terminal gives clues and opens the archive only for the research code', () => {
  const html = readFileSync('index.html', 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'script is embedded in index.html');
  assert.match(html, /<style>[\s\S]*?<\/style>/);
  assert.doesNotMatch(html, /(?:src|href)="(?:script\.js|styles\.css|favicon\.svg)"/);
  const context = vm.createContext({});
  vm.runInContext(script, context);

  assert.match(context.runTerminal('help').message, /scan/);
  assert.match(context.runTerminal('scan').message, /ZMB/);
  assert.equal(context.runTerminal('auth WRONG').unlocked, false);
  assert.equal(context.runTerminal('auth ZMB-17B').unlocked, true);
});
