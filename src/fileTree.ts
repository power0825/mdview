import type { MarkdownFile } from './types';

export type FileTreeNode = FolderTreeNode | FileTreeLeaf;

export interface FolderTreeNode {
  type: 'folder';
  name: string;
  path: string;
  children: FileTreeNode[];
}

export interface FileTreeLeaf {
  type: 'file';
  name: string;
  path: string;
}

function normalizePath(filePath: string) {
  return filePath.replace(/\\/g, '/').replace(/\/+$/g, '');
}

function joinPath(...parts: string[]) {
  return parts.map((part) => normalizePath(part)).join('/');
}

function getRelativeParts(rootPath: string, filePath: string) {
  const normalizedRoot = normalizePath(rootPath);
  const normalizedFile = normalizePath(filePath);
  const relative = normalizedFile.startsWith(`${normalizedRoot}/`)
    ? normalizedFile.slice(normalizedRoot.length + 1)
    : normalizedFile;

  return relative.split('/').filter(Boolean);
}

function sortNodes(nodes: FileTreeNode[]) {
  nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }

    return a.name.localeCompare(b.name, 'zh-CN');
  });

  nodes.forEach((node) => {
    if (node.type === 'folder') {
      sortNodes(node.children);
    }
  });
}

export function buildFileTree(rootPath: string, files: MarkdownFile[]): FileTreeNode[] {
  const root: FolderTreeNode = {
    type: 'folder',
    name: normalizePath(rootPath).split('/').pop() || rootPath,
    path: normalizePath(rootPath),
    children: [],
  };

  files.forEach((file) => {
    const parts = getRelativeParts(rootPath, file.path);
    let current = root;

    parts.slice(0, -1).forEach((folderName) => {
      const folderPath = joinPath(current.path, folderName);
      let folder = current.children.find(
        (child): child is FolderTreeNode =>
          child.type === 'folder' && child.name === folderName
      );

      if (!folder) {
        folder = {
          type: 'folder',
          name: folderName,
          path: folderPath,
          children: [],
        };
        current.children.push(folder);
      }

      current = folder;
    });

    current.children.push({
      type: 'file',
      name: file.name,
      path: normalizePath(file.path),
    });
  });

  sortNodes(root.children);
  return root.children;
}
