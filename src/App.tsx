import { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { themes, Theme } from './themes';
import type { MarkdownFile } from './types';
import { parseToc, renderMarkdown, type TocItem } from './markdown';
import { createPdfExportOptions } from './pdfExport';
import { shouldShowContentToolbar } from './readingView';
import { buildFileTree, type FileTreeNode } from './fileTree';
import { searchMarkdownFiles, type SearchResult } from './search';
import { getSearchQueryOccurrenceIndexBeforeLine } from './searchNavigation';
import { getActiveHeadingId, type HeadingPosition } from './readingProgress';
import { addOpenedFile } from './openedFiles';
import {
  RECENT_STORAGE_KEY,
  addRecentEntry,
  parseRecentEntries,
  type RecentEntry,
} from './recent';
import './App.css';

function App() {
  const [currentFile, setCurrentFile] = useState<MarkdownFile | null>(null);
  const [folderFiles, setFolderFiles] = useState<MarkdownFile[]>([]);
  const [folderPath, setFolderPath] = useState<string>('');
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[2]);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [tocVisible, setTocVisible] = useState(true);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [zoom, setZoom] = useState(1);
  const [showMenu, setShowMenu] = useState(false);
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([]);
  const [openedFiles, setOpenedFiles] = useState<MarkdownFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [activeTocId, setActiveTocId] = useState('');
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
  const contentRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedThemeId = localStorage.getItem('mdview-theme');
    if (savedThemeId) {
      const theme = themes.find((t) => t.id === savedThemeId);
      if (theme) {
        setCurrentTheme(theme);
      }
    }
    const savedZoom = localStorage.getItem('mdview-zoom');
    if (savedZoom) {
      setZoom(parseFloat(savedZoom));
    }
    setRecentEntries(parseRecentEntries(localStorage.getItem(RECENT_STORAGE_KEY)));
  }, []);

  useEffect(() => {
    window.electronAPI.getStartupFile().then((result) => {
      if (result) {
        openMarkdownFile(result);
      }
    });

    return window.electronAPI.onOpenMarkdownFile((file) => {
      openMarkdownFile(file);
    });
  }, []);

  // 解析目录
  useEffect(() => {
    if (currentFile?.content) {
      const parsedToc = parseToc(currentFile.content);
      setToc(parsedToc);
      setActiveTocId(parsedToc[0]?.id || '');
    } else {
      setToc([]);
      setActiveTocId('');
    }
  }, [currentFile?.content]);

  // 保存 zoom 到 localStorage
  useEffect(() => {
    localStorage.setItem('mdview-zoom', zoom.toString());
  }, [zoom]);

  // 点击菜单外关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 全屏快捷键 F11 和 ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.key === 'Escape' && searchActive) {
        e.preventDefault();
        setSearchQuery('');
        setSearchActive(false);
        return;
      }
      if (e.key === 'Escape' && (!sidebarVisible || !tocVisible)) {
        e.preventDefault();
        setSidebarVisible(true);
        setTocVisible(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setSidebarVisible(true);
        setSearchActive(true);
        window.setTimeout(() => searchInputRef.current?.focus(), 0);
      }
      // Ctrl + 滚轮 / Ctrl + +/-
      if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom((z) => Math.min(z + 0.1, 3));
      }
      if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        setZoom((z) => Math.max(z - 0.1, 0.5));
      }
      if (e.ctrlKey && e.key === '0') {
        e.preventDefault();
        setZoom(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarVisible, tocVisible, searchActive]);

  // Ctrl + 鼠标滚轮缩放
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom((z) => Math.min(Math.max(z + delta, 0.5), 3));
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    const container = contentRef.current;
    if (!container || toc.length === 0) {
      return;
    }

    const updateActiveHeading = () => {
      const containerTop = container.getBoundingClientRect().top;
      const headings: HeadingPosition[] = Array.from(
        container.querySelectorAll<HTMLElement>('.markdown-body h1[id], .markdown-body h2[id], .markdown-body h3[id], .markdown-body h4[id], .markdown-body h5[id], .markdown-body h6[id]')
      ).map((heading) => ({
        id: heading.id,
        top: heading.getBoundingClientRect().top - containerTop,
      }));

      setActiveTocId(getActiveHeadingId(headings, 96));
    };

    updateActiveHeading();
    container.addEventListener('scroll', updateActiveHeading);
    return () => container.removeEventListener('scroll', updateActiveHeading);
  }, [currentFile?.content, toc.length, zoom]);

  const rememberEntry = (entry: Omit<RecentEntry, 'lastOpenedAt'>) => {
    setRecentEntries((entries) => {
      const nextEntries = addRecentEntry(entries, {
        ...entry,
        lastOpenedAt: Date.now(),
      });
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(nextEntries));
      return nextEntries;
    });
  };

  const openMarkdownFile = (
    result: { path: string; name: string; content: string },
    remember = true
  ) => {
    setCurrentFile(result);
    setOpenedFiles((files) => addOpenedFile(files, result));
    setFolderFiles([]);
    setFolderPath('');
    setSidebarVisible(true);
    setTocVisible(true);
    setZoom(1);
    setSearchQuery('');
    setSearchActive(false);

    if (remember) {
      rememberEntry({ type: 'file', path: result.path, name: result.name });
    }
  };

  const openFolderResult = (
    result: { path: string; files: MarkdownFile[] },
    remember = true
  ) => {
    setFolderPath(result.path);
    setFolderFiles(result.files);
    setCurrentFile(null);
    setSidebarVisible(true);
    setTocVisible(true);
    setSearchQuery('');
    setSearchActive(false);
    setCollapsedFolders(new Set());

    if (remember) {
      rememberEntry({
        type: 'folder',
        path: result.path,
        name: result.path.split(/[\\/]/).filter(Boolean).pop() || result.path,
      });
    }
  };

  const handleSelectFile = async () => {
    const result = await window.electronAPI.selectMarkdownFile();
    if (result) {
      openMarkdownFile(result);
    }
  };

  const handleSelectFolder = async () => {
    const result = await window.electronAPI.selectFolder();
    if (result) {
      openFolderResult(result);
    }
  };

  const handleFileClick = async (filePath: string) => {
    const existingFile =
      folderFiles.find((file) => file.path === filePath) ||
      openedFiles.find((file) => file.path === filePath);
    const result = existingFile?.content
      ? {
          path: existingFile.path,
          name: existingFile.name,
          content: existingFile.content,
        }
      : await window.electronAPI.readMarkdownFile(filePath);

    if (result) {
      setCurrentFile(result);
      setOpenedFiles((files) => addOpenedFile(files, result));
      setSidebarVisible(true);
      setTocVisible(true);
    }
  };

  const handleRecentClick = async (entry: RecentEntry) => {
    const result = await window.electronAPI.openPath(entry.path);
    if (!result) {
      return;
    }

    if (result.type === 'file') {
      openMarkdownFile(result.file);
    } else {
      openFolderResult(result);
    }
  };

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('mdview-theme', theme.id);
  };

  const toggleFullscreen = () => {
    setSidebarVisible(!sidebarVisible);
    setTocVisible(!tocVisible);
    setShowMenu(false);
  };

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const findNthTextMatchElement = (
    root: HTMLElement,
    query: string,
    targetOccurrenceIndex: number
  ) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return null;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let seen = 0;
    let node = walker.nextNode();

    while (node) {
      const text = node.textContent?.toLowerCase() || '';
      let matchIndex = text.indexOf(normalizedQuery);

      while (matchIndex !== -1) {
        if (seen === targetOccurrenceIndex) {
          return node.parentElement;
        }

        seen += 1;
        matchIndex = text.indexOf(normalizedQuery, matchIndex + normalizedQuery.length);
      }

      node = walker.nextNode();
    }

    return null;
  };

  const scrollToSearchResult = (result: SearchResult) => {
    const container = contentRef.current;
    const markdownBody = container?.querySelector<HTMLElement>('.markdown-body');
    if (!container || !markdownBody) {
      return;
    }

    if (result.matchType === 'name') {
      container.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return;
    }

    const occurrenceIndex = getSearchQueryOccurrenceIndexBeforeLine(
      currentFile?.content || '',
      query,
      result.lineNumber
    );
    const target =
      findNthTextMatchElement(markdownBody, query, occurrenceIndex) ||
      findNthTextMatchElement(markdownBody, query, 0);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('search-hit');
      window.setTimeout(() => target.classList.remove('search-hit'), 1600);
    }
  };

  const handleSearchResultClick = async (result: SearchResult) => {
    if (currentFile?.path !== result.filePath) {
      await handleFileClick(result.filePath);
      window.setTimeout(() => scrollToSearchResult(result), 80);
      return;
    }

    scrollToSearchResult(result);
  };

  const closeSearch = () => {
    setSearchQuery('');
    setSearchActive(false);
  };

  const exportToPdf = async () => {
    if (!contentRef.current || !currentFile) return;

    const element = contentRef.current.querySelector<HTMLElement>('.markdown-body');
    if (!element) return;

    const opt = createPdfExportOptions(currentFile.name);

    // 临时显示所有边栏以确保正确渲染
    const wasFullscreen = !sidebarVisible || !tocVisible;
    if (wasFullscreen) {
      setSidebarVisible(true);
      setTocVisible(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF export failed:', error);
    }

    if (wasFullscreen) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSidebarVisible(false);
      setTocVisible(false);
    }
    setShowMenu(false);
  };

  const renderMarkdownHtml = (content: string) => {
    return { __html: renderMarkdown(content) };
  };

  const isFullscreen = !sidebarVisible && !tocVisible;
  const showContentToolbar = shouldShowContentToolbar({
    hasCurrentFile: Boolean(currentFile),
    isFullscreen,
  });
  const fileTree = folderPath ? buildFileTree(folderPath, folderFiles) : [];
  const searchableFiles = currentFile ? [currentFile] : [];
  const searchResults = searchMarkdownFiles(searchableFiles, searchQuery);
  const showFilePanel = folderPath || openedFiles.length > 0;

  const toggleFolder = (folderNodePath: string) => {
    setCollapsedFolders((folders) => {
      const nextFolders = new Set(folders);
      if (nextFolders.has(folderNodePath)) {
        nextFolders.delete(folderNodePath);
      } else {
        nextFolders.add(folderNodePath);
      }
      return nextFolders;
    });
  };

  const renderFileTree = (nodes: FileTreeNode[], depth = 0) => {
    return nodes.map((node) => {
      if (node.type === 'folder') {
        const collapsed = collapsedFolders.has(node.path);
        return (
          <li key={node.path}>
            <button
              type="button"
              className="tree-folder"
              style={{ paddingLeft: 12 + depth * 14 }}
              onClick={() => toggleFolder(node.path)}
              title={node.path}
            >
              <span>{collapsed ? '▸' : '▾'}</span>
              <span>{node.name}</span>
            </button>
            {!collapsed && <ul>{renderFileTree(node.children, depth + 1)}</ul>}
          </li>
        );
      }

      return (
        <li key={node.path}>
          <button
            type="button"
            className={`tree-file ${currentFile?.path === node.path ? 'active' : ''}`}
            style={{
              paddingLeft: 12 + depth * 14,
              backgroundColor:
                currentFile?.path === node.path ? currentTheme.activeBackground : 'transparent',
            }}
            onClick={() => handleFileClick(node.path)}
            title={node.path}
          >
            <span>📄</span>
            <span>{node.name}</span>
          </button>
        </li>
      );
    });
  };

  const renderOpenedFiles = () => {
    return openedFiles.map((file) => (
      <button
        type="button"
        key={file.path}
        className={`opened-file ${currentFile?.path === file.path ? 'active' : ''}`}
        style={{
          backgroundColor:
            currentFile?.path === file.path ? currentTheme.activeBackground : 'transparent',
        }}
        onClick={() => handleFileClick(file.path)}
        title={file.path}
      >
        <span>MD</span>
        <span>{file.name}</span>
      </button>
    ));
  };

  const renderSearchResults = (results: SearchResult[]) => {
    return results.map((result) => (
      <button
        type="button"
        key={`${result.filePath}-${result.matchType}-${result.lineNumber || 0}`}
        className="search-result"
        onClick={() => handleSearchResultClick(result)}
        title={result.filePath}
      >
        <span className="search-result-name">{result.fileName}</span>
        <span className="search-result-meta">
          {result.matchType === 'content' && result.lineNumber
            ? `第 ${result.lineNumber} 行`
            : '文件名'}
        </span>
        <span className="search-result-snippet">{result.snippet}</span>
      </button>
    ));
  };

  const renderToc = (items: TocItem[], depth = 0) => {
    return items.map((item) => (
      <li key={item.id} style={{ paddingLeft: depth * 12 }}>
        <a
          href="#"
          className={activeTocId === item.id ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            scrollToHeading(item.id);
          }}
          title={item.text}
        >
          {item.text}
        </a>
        {item.children.length > 0 && (
          <ul>{renderToc(item.children, depth + 1)}</ul>
        )}
      </li>
    ));
  };

  return (
    <div
      className="app-container"
      style={{
        backgroundColor: currentTheme.background,
        color: currentTheme.textColor,
      }}
    >
      {/* 侧边栏 */}
      <div
        className={`sidebar ${!sidebarVisible ? 'sidebar-hidden' : ''}`}
        style={{
          width: sidebarVisible ? 300 : 0,
          backgroundColor: currentTheme.sidebarBackground,
          borderRight: sidebarVisible ? `1px solid ${currentTheme.borderColor}` : 'none',
        }}
      >
        <div className="sidebar-header">
          <h2>MDView</h2>
          <div className="toolbar">
            <button onClick={handleSelectFile} title="打开文件">
              📄 文件
            </button>
            <button onClick={handleSelectFolder} title="打开文件夹">
              📁 文件夹
            </button>
          </div>
        </div>

        <div className="theme-selector">
          <label>主题：</label>
          <select
            value={currentTheme.id}
            onChange={(e) => {
              const theme = themes.find((t) => t.id === e.target.value);
              if (theme) handleThemeChange(theme);
            }}
          >
            {themes.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
        </div>

        {recentEntries.length > 0 && !folderPath && !currentFile && (
          <div className="recent-list">
            <div className="section-title">最近打开</div>
            {recentEntries.map((entry) => (
              <button
                type="button"
                key={`${entry.type}-${entry.path}`}
                className="recent-item"
                onClick={() => handleRecentClick(entry)}
                title={entry.path}
              >
                <span>{entry.type === 'folder' ? '📁' : '📄'}</span>
                <span>{entry.name}</span>
              </button>
            ))}
          </div>
        )}

        {showFilePanel && (
          <div className="file-list">
            {openedFiles.length > 0 && (
              <div className="opened-files">
                <div className="section-title">已打开</div>
                {renderOpenedFiles()}
              </div>
            )}
            {folderPath && (
              <div className="file-list-header">
                <span title={folderPath} className="folder-path">
                  {folderPath}
                </span>
                <span className="file-count">{folderFiles.length} 个文件</span>
              </div>
            )}
            {searchActive && (
              <div className="search-box">
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={currentFile ? '搜索当前文件全文' : '先选择一个文件再搜索'}
                />
                <button
                  type="button"
                  className="search-close"
                  onClick={closeSearch}
                  title="退出搜索"
                  aria-label="退出搜索"
                >
                  ×
                </button>
              </div>
            )}
            {searchActive && searchQuery.trim() ? (
              <div className="search-results">
                {searchResults.length > 0 ? (
                  renderSearchResults(searchResults)
                ) : (
                  <div className="empty-small">没有找到匹配内容</div>
                )}
              </div>
            ) : searchActive ? (
              <div className="empty-small">输入关键词搜索当前文件</div>
            ) : folderPath ? (
              <ul className="tree-list">{renderFileTree(fileTree)}</ul>
            ) : (
              <div className="empty-small">按 Ctrl+F 搜索当前文件</div>
            )}
          </div>
        )}

        {currentFile && !folderPath && openedFiles.length === 0 && (
          <div className="current-file-info">
            <strong>当前文件：</strong>
            <span title={currentFile.path}>{currentFile.name}</span>
          </div>
        )}
      </div>

      {/* 目录导航 */}
      {currentFile && toc.length > 0 && (
        <div
          className={`toc-sidebar ${!tocVisible ? 'toc-hidden' : ''}`}
          style={{
            backgroundColor: currentTheme.sidebarBackground,
            borderRight: tocVisible ? `1px solid ${currentTheme.borderColor}` : 'none',
          }}
        >
          <div className="toc-header">
            <h3>目录</h3>
          </div>
          <div className="toc-content">
            <ul>{renderToc(toc)}</ul>
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <div
        className={`main-content ${isFullscreen ? 'main-fullscreen' : ''}`}
        ref={contentRef}
        style={{
          backgroundColor: currentTheme.background,
        }}
      >
        {/* 顶部工具栏 */}
        {showContentToolbar && currentFile && (
          <div className="content-toolbar">
            <div className="toolbar-left">
              <span className="file-name">{currentFile.name}</span>
            </div>
            <div className="toolbar-right">
              <span className="zoom-indicator">{Math.round(zoom * 100)}%</span>
              <div className="menu-container" ref={menuRef}>
                <button
                  className="icon-btn menu-btn"
                  onClick={() => setShowMenu(!showMenu)}
                  title="菜单"
                >
                  ☰
                </button>
                {showMenu && (
                  <div className="dropdown-menu">
                    <div className="menu-item" onClick={toggleFullscreen}>
                      {sidebarVisible ? '⛶ 全屏模式' : '⛶ 退出全屏'}
                      <span className="shortcut">F11</span>
                    </div>
                    <div className="menu-item" onClick={exportToPdf}>
                      📥 导出 PDF
                      <span className="shortcut"></span>
                    </div>
                    <hr />
                    <div className="menu-item" onClick={() => setZoom((z) => Math.min(z + 0.1, 3))}>
                      🔍 放大
                      <span className="shortcut">Ctrl++</span>
                    </div>
                    <div className="menu-item" onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}>
                      🔎 缩小
                      <span className="shortcut">Ctrl+-</span>
                    </div>
                    <div className="menu-item" onClick={() => setZoom(1)}>
                      ↺ 重置缩放
                      <span className="shortcut">Ctrl+0</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div
          className="markdown-body"
          style={{ zoom: zoom }}
          dangerouslySetInnerHTML={renderMarkdownHtml(currentFile?.content || '')}
        />

        {!currentFile && (
          <div className="empty-state">
            <div className="empty-icon">📖</div>
            <h3>欢迎使用 MDView</h3>
            <p>点击上方按钮打开 Markdown 文件或文件夹开始浏览</p>
            <div className="shortcuts">
              <p>💡 提示：</p>
              <ul>
                <li>支持打开单个 .md 或 .markdown 文件</li>
                <li>支持打开文件夹，自动扫描所有 Markdown 文件</li>
                <li>按 F11 切换全屏模式，ESC 退出全屏</li>
                <li>Ctrl + 滚轮或 Ctrl + +/- 缩放</li>
                <li>有标题的文章会自动显示目录</li>
                <li>菜单中支持导出为 PDF 格式</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
