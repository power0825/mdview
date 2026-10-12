export interface MarkdownFile {
  path: string;
  name: string;
  content?: string;
}

export interface FolderResult {
  path: string;
  files: MarkdownFile[];
}

export type OpenPathResult =
  | { type: 'file'; file: { path: string; name: string; content: string } }
  | { type: 'folder'; path: string; files: MarkdownFile[] }
  | null;

export interface ElectronAPI {
  selectMarkdownFile: () => Promise<{ path: string; name: string; content: string } | null>;
  selectFolder: () => Promise<{ path: string; files: MarkdownFile[] } | null>;
  readMarkdownFile: (filePath: string) => Promise<{ path: string; name: string; content: string } | null>;
  openPath: (targetPath: string) => Promise<OpenPathResult>;
  getStartupFile: () => Promise<{ path: string; name: string; content: string } | null>;
  onOpenMarkdownFile: (
    callback: (file: { path: string; name: string; content: string }) => void
  ) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
