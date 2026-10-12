export interface HeadingPosition {
  id: string;
  top: number;
}

export function getActiveHeadingId(
  headings: HeadingPosition[],
  thresholdTop: number
) {
  if (headings.length === 0) {
    return '';
  }

  let activeId = headings[0].id;

  for (const heading of headings) {
    if (heading.top <= thresholdTop) {
      activeId = heading.id;
    } else {
      break;
    }
  }

  return activeId;
}
