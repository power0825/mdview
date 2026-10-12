export type RecentEntryType = 'file' | 'folder';

export interface RecentEntry {
  type: RecentEntryType;
  path: string;
  name: string;
  lastOpenedAt: number;
}

export const RECENT_STORAGE_KEY = 'mdview-recent';

export function addRecentEntry(
  entries: RecentEntry[],
  nextEntry: RecentEntry,
  maxEntries = 10
) {
  return [
    nextEntry,
    ...entries.filter(
      (entry) => entry.type !== nextEntry.type || entry.path !== nextEntry.path
    ),
  ]
    .sort((a, b) => b.lastOpenedAt - a.lastOpenedAt)
    .slice(0, maxEntries);
}

export function parseRecentEntries(value: string | null): RecentEntry[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((entry): entry is RecentEntry => {
      return (
        (entry?.type === 'file' || entry?.type === 'folder') &&
        typeof entry.path === 'string' &&
        typeof entry.name === 'string' &&
        typeof entry.lastOpenedAt === 'number'
      );
    });
  } catch {
    return [];
  }
}
