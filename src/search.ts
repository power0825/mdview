import type { MarkdownFile } from './types';

export type SearchMatchType = 'name' | 'content';

export interface SearchResult {
  filePath: string;
  fileName: string;
  matchType: SearchMatchType;
  lineNumber?: number;
  snippet: string;
}

function includesIgnoreCase(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

export function searchMarkdownFiles(
  files: MarkdownFile[],
  rawQuery: string,
  maxResults = 50
): SearchResult[] {
  const query = rawQuery.trim();
  if (!query) {
    return [];
  }

  const results: SearchResult[] = [];

  for (const file of files) {
    if (includesIgnoreCase(file.name, query)) {
      results.push({
        filePath: file.path,
        fileName: file.name,
        matchType: 'name',
        snippet: file.name,
      });
    }

    const lines = (file.content || '').split(/\r?\n/);

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      if (includesIgnoreCase(lines[lineIndex], query)) {
        results.push({
          filePath: file.path,
          fileName: file.name,
          matchType: 'content',
          lineNumber: lineIndex + 1,
          snippet: lines[lineIndex].trim(),
        });
      }

      if (results.length >= maxResults) {
        return results.slice(0, maxResults);
      }
    }
  }

  return results;
}
