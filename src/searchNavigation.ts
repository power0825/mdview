export function getSearchResultOccurrenceIndex(
  snippets: string[],
  targetSnippet: string,
  targetIndex: number
) {
  let seen = 0;

  for (let index = 0; index <= targetIndex; index += 1) {
    if (snippets[index] === targetSnippet) {
      seen += 1;
    }
  }

  return Math.max(seen - 1, 0);
}

function countOccurrencesIgnoreCase(value: string, query: string) {
  if (!query) {
    return 0;
  }

  let count = 0;
  let index = value.toLowerCase().indexOf(query.toLowerCase());

  while (index !== -1) {
    count += 1;
    index = value.toLowerCase().indexOf(query.toLowerCase(), index + query.length);
  }

  return count;
}

export function getSearchQueryOccurrenceIndexBeforeLine(
  content: string,
  query: string,
  lineNumber?: number
) {
  if (!lineNumber || lineNumber <= 1) {
    return 0;
  }

  const linesBeforeTarget = content.split(/\r?\n/).slice(0, lineNumber - 1);
  return linesBeforeTarget.reduce(
    (total, line) => total + countOccurrencesIgnoreCase(line, query),
    0
  );
}
