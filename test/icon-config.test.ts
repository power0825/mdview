import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Windows package uses the MD icon asset', () => {
  const packageJson = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));

  assert.equal(packageJson.build.win.icon, 'build/icon.ico');
  assert.ok(fs.existsSync(new URL('../build/icon.ico', import.meta.url)));
});

test('Windows icon uses DIB frames for small shell icon sizes', () => {
  const icon = fs.readFileSync(new URL('../build/icon.ico', import.meta.url));
  const count = icon.readUInt16LE(4);
  const frames = new Map<number, string>();

  for (let index = 0; index < count; index += 1) {
    const entryOffset = 6 + index * 16;
    const size = icon[entryOffset] || 256;
    const imageOffset = icon.readUInt32LE(entryOffset + 12);
    const signature = icon.subarray(imageOffset, imageOffset + 8).toString('hex');
    frames.set(size, signature === '89504e470d0a1a0a' ? 'PNG' : 'DIB');
  }

  assert.equal(frames.get(16), 'DIB');
  assert.equal(frames.get(32), 'DIB');
  assert.equal(frames.get(48), 'DIB');
  assert.equal(frames.get(256), 'PNG');
});
