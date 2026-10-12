import type { MarkdownFile } from './types';

export function addOpenedFile(files: MarkdownFile[], file: MarkdownFile): MarkdownFile[] {
  const existingIndex = files.findIndex((item) => item.path === file.path);

  if (existingIndex === -1) {
    return [...files, file];
  }

  return files.map((item, index) => (index === existingIndex ? file : item));
}
