import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { getStartupMarkdownFile } from './startup';
import { ensureWindowsFileAssociationsOnce } from './fileAssociations';

let mainWindow: BrowserWindow | null = null;
let startupFilePath: string | null = getStartupMarkdownFile(process.argv);

function readMarkdownFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return {
    path: filePath,
    name: path.basename(filePath),
    content,
  };
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // 开发模式加载 Vite 服务器，生产模式加载打包文件
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, argv) => {
    const filePath = getStartupMarkdownFile(argv);
    if (filePath && mainWindow) {
      try {
        mainWindow.webContents.send('open-markdown-file', readMarkdownFile(filePath));
      } catch (error) {
        console.error('Error opening associated file:', error);
      }
    }

    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();

    if (process.platform === 'win32' && app.isPackaged) {
      setTimeout(() => {
        try {
          ensureWindowsFileAssociationsOnce(
            process.execPath,
            app.getVersion(),
            path.join(app.getPath('userData'), 'file-associations.json')
          );
        } catch (error) {
          console.warn('Unable to repair MDView file associations:', error);
        }
      }, 1500);
    }
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC 处理器：选择并读取 Markdown 文件
ipcMain.handle('select-markdown-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [{ name: 'Markdown Files', extensions: ['md', 'markdown'] }],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  return readMarkdownFile(filePath);
});

// IPC 处理器：选择文件夹并获取所有 Markdown 文件
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const folderPath = result.filePaths[0];
  const files = getMarkdownFilesInFolder(folderPath);
  return {
    path: folderPath,
    files: files,
  };
});

function getMarkdownFilesInFolder(folderPath: string): { path: string; name: string; content: string }[] {
  const files: { path: string; name: string; content: string }[] = [];

  function scanDirectory(dir: string) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          scanDirectory(fullPath);
        } else if (entry.isFile() && /\.(md|markdown)$/i.test(entry.name)) {
          files.push(readMarkdownFile(fullPath));
        }
      }
    } catch (error) {
      console.error('Error reading directory:', error);
    }
  }

  scanDirectory(folderPath);
  return files;
}

// IPC 处理器：读取 Markdown 文件内容
ipcMain.handle('read-markdown-file', async (event, filePath: string) => {
  try {
    return readMarkdownFile(filePath);
  } catch (error) {
    return null;
  }
});

ipcMain.handle('open-path', async (_event, targetPath: string) => {
  try {
    const stat = fs.statSync(targetPath);
    if (stat.isDirectory()) {
      return {
        type: 'folder',
        path: targetPath,
        files: getMarkdownFilesInFolder(targetPath),
      };
    }

    if (stat.isFile() && /\.(md|markdown)$/i.test(targetPath)) {
      return {
        type: 'file',
        file: readMarkdownFile(targetPath),
      };
    }
  } catch (error) {
    console.error('Error opening path:', error);
  }

  return null;
});

ipcMain.handle('get-startup-file', async () => {
  if (!startupFilePath) {
    return null;
  }

  try {
    const file = readMarkdownFile(startupFilePath);
    startupFilePath = null;
    return file;
  } catch (error) {
    console.error('Error reading startup file:', error);
    startupFilePath = null;
    return null;
  }
});
