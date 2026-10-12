export interface ContentToolbarState {
  hasCurrentFile: boolean;
  isFullscreen: boolean;
}

export function shouldShowContentToolbar({
  hasCurrentFile,
  isFullscreen,
}: ContentToolbarState) {
  return hasCurrentFile && !isFullscreen;
}
