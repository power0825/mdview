import { contextBridge, ipcRenderer } from 'electron';

// 暴露安全的 IPC 接口给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  selectMarkdownFile: () => ipcRenderer.invoke('select-markdown-file'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  readMarkdownFile: (filePath: string) => ipcRenderer.invoke('read-markdown-file', filePath),
  openPath: (targetPath: string) => ipcRenderer.invoke('open-path', targetPath),
  getStartupFile: () => ipcRenderer.invoke('get-startup-file'),
  onOpenMarkdownFile: (callback: (file: { path: string; name: string; content: string }) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, file: { path: string; name: string; content: string }) => {
      callback(file);
    };
    ipcRenderer.on('open-markdown-file', listener);
    return () => ipcRenderer.removeListener('open-markdown-file', listener);
  },
});
