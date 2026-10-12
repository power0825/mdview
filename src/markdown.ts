import { marked, type Tokens } from 'marked';

export interface TocItem {
  id: string;
  text: string;
  level: number;
  children: TocItem[];
}

function createSlugger() {
  const headingCounts = new Map<string, number>();

  return (text: string) => {
    const baseId =
      text
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'heading';

    const count = headingCounts.get(baseId) || 0;
    headingCounts.set(baseId, count + 1);
    return count > 0 ? `${baseId}-${count}` : baseId;
  };
}

function getHeadingText(token: Tokens.Heading) {
  return token.text.trim();
}

export function parseToc(content: string): TocItem[] {
  const tokens = marked.lexer(content);
  const slug = createSlugger();
  const root: TocItem[] = [];
  const stack: { item: TocItem; level: number }[] = [];

  tokens.forEach((token) => {
    if (token.type !== 'heading') {
      return;
    }

    const heading = token as Tokens.Heading;
    const item: TocItem = {
      id: slug(getHeadingText(heading)),
      text: getHeadingText(heading),
      level: heading.depth,
      children: [],
    };

    while (stack.length > 0 && stack[stack.length - 1].level >= heading.depth) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(item);
    } else {
      stack[stack.length - 1].item.children.push(item);
    }

    stack.push({ item, level: heading.depth });
  });

  return root;
}

export function renderMarkdown(content: string) {
  const renderer = new marked.Renderer();
  const slug = createSlugger();

  renderer.heading = ({ tokens, depth, text }: Tokens.Heading) => {
    const headingText = text.trim();
    const id = slug(headingText);
    return `<h${depth} id="${id}">${marked.Parser.parseInline(tokens)}</h${depth}>`;
  };

  return marked.parse(content, { renderer, async: false });
}
