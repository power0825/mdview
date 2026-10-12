import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

type DeleteKeyOperation = {
  action: 'delete-key';
  key: string;
};

type AddDefaultOperation = {
  action: 'add-default';
  key: string;
  data: string;
};

type AddValueOperation = {
  action: 'add-value';
  key: string;
  name: string;
  data: string;
};

export type RegistryOperation = DeleteKeyOperation | AddDefaultOperation | AddValueOperation;

interface FileAssociationMarker {
  exePath: string;
  appVersion: string;
}

function quoteWindowsPath(value: string) {
  return `"${value}"`;
}

export function getWindowsFileAssociationOperations(exePath: string): RegistryOperation[] {
  const quotedExe = quoteWindowsPath(exePath);
  const openCommand = `${quotedExe} "%1"`;
  const iconPath = `${quotedExe},0`;

  return [
    { action: 'delete-key', key: 'HKCU\\Software\\Classes\\Applications\\mdview.exe' },
    { action: 'delete-key', key: 'HKCU\\Software\\Classes\\Applications\\electron.exe' },
    { action: 'delete-key', key: 'HKCU\\Software\\Classes\\mdview' },
    { action: 'delete-key', key: 'HKCU\\Software\\Classes\\Electron' },

    { action: 'add-default', key: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\MDView.exe', data: exePath },
    { action: 'add-value', key: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\MDView.exe', name: 'Path', data: path.dirname(exePath) },

    { action: 'add-value', key: 'HKCU\\Software\\Classes\\Applications\\MDView.exe', name: 'FriendlyAppName', data: 'MDView' },
    { action: 'add-value', key: 'HKCU\\Software\\Classes\\Applications\\MDView.exe\\SupportedTypes', name: '.md', data: '' },
    { action: 'add-value', key: 'HKCU\\Software\\Classes\\Applications\\MDView.exe\\SupportedTypes', name: '.markdown', data: '' },
    { action: 'add-default', key: 'HKCU\\Software\\Classes\\Applications\\MDView.exe\\shell\\open\\command', data: openCommand },

    { action: 'add-default', key: 'HKCU\\Software\\Classes\\MDView.Markdown', data: 'Markdown Document' },
    { action: 'add-default', key: 'HKCU\\Software\\Classes\\MDView.Markdown\\DefaultIcon', data: iconPath },
    { action: 'add-default', key: 'HKCU\\Software\\Classes\\MDView.Markdown\\shell\\open', data: 'Open with MDView' },
    { action: 'add-default', key: 'HKCU\\Software\\Classes\\MDView.Markdown\\shell\\open\\command', data: openCommand },

    { action: 'add-value', key: 'HKCU\\Software\\Classes\\.md\\OpenWithProgids', name: 'MDView.Markdown', data: '' },
    { action: 'add-value', key: 'HKCU\\Software\\Classes\\.markdown\\OpenWithProgids', name: 'MDView.Markdown', data: '' },

    { action: 'add-value', key: 'HKCU\\Software\\MDView\\Capabilities', name: 'ApplicationName', data: 'MDView' },
    { action: 'add-value', key: 'HKCU\\Software\\MDView\\Capabilities', name: 'ApplicationDescription', data: 'Markdown file viewer' },
    { action: 'add-value', key: 'HKCU\\Software\\MDView\\Capabilities\\FileAssociations', name: '.md', data: 'MDView.Markdown' },
    { action: 'add-value', key: 'HKCU\\Software\\MDView\\Capabilities\\FileAssociations', name: '.markdown', data: 'MDView.Markdown' },
    { action: 'add-value', key: 'HKCU\\Software\\RegisteredApplications', name: 'MDView', data: 'Software\\MDView\\Capabilities' },
  ];
}

export function getRegistryOperationArgs(operation: RegistryOperation) {
  if (operation.action === 'delete-key') {
    return ['delete', operation.key, '/f'];
  }

  if (operation.action === 'add-default') {
    return ['add', operation.key, '/ve', '/t', 'REG_SZ', '/d', operation.data, '/f'];
  }

  return ['add', operation.key, '/v', operation.name, '/t', 'REG_SZ', '/d', operation.data, '/f'];
}

export function createFileAssociationMarker(exePath: string, appVersion: string) {
  return JSON.stringify({ exePath, appVersion });
}

export function shouldUpdateWindowsFileAssociations(
  markerValue: string,
  exePath: string,
  appVersion: string
) {
  try {
    const marker = JSON.parse(markerValue) as Partial<FileAssociationMarker>;
    return marker.exePath !== exePath || marker.appVersion !== appVersion;
  } catch {
    return true;
  }
}

export function ensureWindowsFileAssociations(exePath: string) {
  for (const operation of getWindowsFileAssociationOperations(exePath)) {
    try {
      execFileSync('reg.exe', getRegistryOperationArgs(operation), { stdio: 'ignore' });
    } catch (error) {
      if (operation.action !== 'delete-key') {
        console.warn('Unable to update MDView file association:', operation.key, error);
      }
    }
  }
}

export function ensureWindowsFileAssociationsOnce(
  exePath: string,
  appVersion: string,
  markerPath: string
) {
  const markerValue = fs.existsSync(markerPath) ? fs.readFileSync(markerPath, 'utf-8') : '';

  if (!shouldUpdateWindowsFileAssociations(markerValue, exePath, appVersion)) {
    return false;
  }

  ensureWindowsFileAssociations(exePath);
  fs.mkdirSync(path.dirname(markerPath), { recursive: true });
  fs.writeFileSync(markerPath, createFileAssociationMarker(exePath, appVersion), 'utf-8');
  return true;
}
