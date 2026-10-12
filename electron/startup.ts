export function getStartupMarkdownFile(argv: string[]) {
  return (
    argv.find((arg) => {
      if (arg.startsWith('--')) {
        return false;
      }

      return /\.(md|markdown)$/i.test(arg);
    }) || null
  );
}
