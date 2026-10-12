import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createFileAssociationMarker,
  getWindowsFileAssociationOperations,
  shouldUpdateWindowsFileAssociations,
} from '../electron/fileAssociations.ts';

test('builds Windows registry operations for MDView file associations', () => {
  const operations = getWindowsFileAssociationOperations('C:\\Users\\me\\AppData\\Local\\Programs\\MDView\\MDView.exe');

  assert.deepEqual(operations.slice(0, 4), [
    {
      action: 'delete-key',
      key: 'HKCU\\Software\\Classes\\Applications\\mdview.exe',
    },
    {
      action: 'delete-key',
      key: 'HKCU\\Software\\Classes\\Applications\\electron.exe',
    },
    {
      action: 'delete-key',
      key: 'HKCU\\Software\\Classes\\mdview',
    },
    {
      action: 'delete-key',
      key: 'HKCU\\Software\\Classes\\Electron',
    },
  ]);

  assert.ok(
    operations.some(
      (operation) =>
        operation.action === 'add-value' &&
        operation.key === 'HKCU\\Software\\Classes\\Applications\\MDView.exe' &&
        operation.name === 'FriendlyAppName' &&
        operation.data === 'MDView'
    )
  );

  assert.ok(
    operations.some(
      (operation) =>
        operation.action === 'add-default' &&
        operation.key === 'HKCU\\Software\\Classes\\Applications\\MDView.exe\\shell\\open\\command' &&
        operation.data === '"C:\\Users\\me\\AppData\\Local\\Programs\\MDView\\MDView.exe" "%1"'
    )
  );

  assert.ok(
    operations.some(
      (operation) =>
        operation.action === 'add-value' &&
        operation.key === 'HKCU\\Software\\MDView\\Capabilities\\FileAssociations' &&
        operation.name === '.md' &&
        operation.data === 'MDView.Markdown'
    )
  );
});

test('file association marker skips repeated startup registry repair', () => {
  const exePath = 'C:\\Users\\me\\AppData\\Local\\Programs\\MDView\\MDView.exe';
  const marker = createFileAssociationMarker(exePath, '1.0.0');

  assert.equal(shouldUpdateWindowsFileAssociations(marker, exePath, '1.0.0'), false);
  assert.equal(shouldUpdateWindowsFileAssociations(marker, exePath, '1.0.1'), true);
  assert.equal(
    shouldUpdateWindowsFileAssociations(
      marker,
      'D:\\Portable\\MDView\\MDView.exe',
      '1.0.0'
    ),
    true
  );
  assert.equal(shouldUpdateWindowsFileAssociations('', exePath, '1.0.0'), true);
});
