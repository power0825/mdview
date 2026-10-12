# MDView

MDView 是一款轻量的 Markdown 桌面阅读器，支持文件和文件夹浏览、目录导航、多种阅读主题与 PDF 导出。

## 下载和安装（Windows）

下载 [MDView 1.0.0 Windows 安装程序](https://github.com/power0825/mdview/raw/refs/heads/main/downloads/MDView-Setup-1.0.0.exe)，双击运行即可。安装只需要当前 Windows 用户权限。

安装程序会创建开始菜单和桌面快捷方式，并将 MDView 注册为 `.md` 和 `.markdown` 文件的可选打开方式。Windows 默认应用仍由用户决定；如需默认使用 MDView，请在“设置 → 应用 → 默认应用”中选择 MDView。

当前 Windows 安装包尚未进行代码签名。首次运行时，Windows SmartScreen 可能显示未知发布者提示；请确认安装包来自本项目的 GitHub 仓库后再继续。

## 功能

- 浏览 Markdown 文件和文件夹
- 自动生成文档目录并跳转到标题
- 提供明亮、深色、护眼绿、暖色护眼、海洋蓝和午夜蓝主题
- 全屏沉浸阅读
- 将当前文档导出为 PDF
- 从命令行或文件关联打开 Markdown 文件

## 从源码构建

需要 Node.js 和 npm。在 Windows 上执行：

```powershell
npm ci
npm run dist
```

安装程序会生成在 `release/MDView Setup <版本号>.exe`。

启动开发环境：

```powershell
npm run dev
```

## 技术栈

- Electron
- React 19 和 TypeScript
- Vite
- marked
- electron-builder

## 许可证

本项目使用 MIT 许可证，详见 [LICENSE](LICENSE)。
