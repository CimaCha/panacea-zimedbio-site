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

test('unlocked archive contains exactly two folders with the requested records', () => {
  const html = readFileSync('index.html', 'utf8');
  const archive = html.match(/<div id="archive"[\s\S]*?<\/div><\/div><\/dialog>/)?.[0];
  assert.ok(archive, 'archive is present in the terminal');
  assert.equal((archive.match(/<details class="report"/g) || []).length, 2);
  assert.match(archive, /FDA[\s\S]*?Зилактис[\s\S]*?клеточн(?:ые|ых) мутац/);
  assert.match(archive, /третичн(?:ый|ого) биоцит[\s\S]*?06:00[\s\S]*?09:00[\s\S]*?14:00/);
  assert.match(archive, /бесконтрольно спариваться/);
  assert.match(archive, /уникальн/);
  assert.match(archive, /умертв/);
  assert.doesNotMatch(archive, /ЭКСПЕРИМЕНТАЛЬНЫЙ ГРАФИК|ПЕРЕПИСКА/);
});
