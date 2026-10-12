// 视觉友好的背景主题配色
export interface Theme {
  id: string;
  name: string;
  background: string;
  sidebarBackground: string;
  textColor: string;
  sidebarText: string;
  hoverBackground: string;
  activeBackground: string;
  borderColor: string;
}

export const themes: Theme[] = [
  {
    id: 'light',
    name: '明亮模式',
    background: '#ffffff',
    sidebarBackground: '#f5f5f5',
    textColor: '#333333',
    sidebarText: '#555555',
    hoverBackground: '#e8e8e8',
    activeBackground: '#e0e0e0',
    borderColor: '#dddddd',
  },
  {
    id: 'dark',
    name: '深色模式',
    background: '#1e1e1e',
    sidebarBackground: '#252526',
    textColor: '#d4d4d4',
    sidebarText: '#cccccc',
    hoverBackground: '#2d2d30',
    activeBackground: '#37373d',
    borderColor: '#3e3e42',
  },
  {
    id: 'eye-protection',
    name: '护眼绿',
    background: '#f0f8f0',
    sidebarBackground: '#e8f5e9',
    textColor: '#2d3e30',
    sidebarText: '#3d5a42',
    hoverBackground: '#c8e6c9',
    activeBackground: '#a5d6a7',
    borderColor: '#c8e6c9',
  },
  {
    id: 'warm',
    name: '暖色护眼',
    background: '#fef9f5',
    sidebarBackground: '#fff8f0',
    textColor: '#4a4a4a',
    sidebarText: '#5a5a5a',
    hoverBackground: '#ffe4c4',
    activeBackground: '#ffdab9',
    borderColor: '#f0e0d0',
  },
  {
    id: 'ocean',
    name: '海洋蓝',
    background: '#f0f4f8',
    sidebarBackground: '#e3f2fd',
    textColor: '#1a3a52',
    sidebarText: '#2c5282',
    hoverBackground: '#bbdefb',
    activeBackground: '#90caf9',
    borderColor: '#b3d9ff',
  },
  {
    id: 'midnight',
    name: '午夜蓝',
    background: '#0f172a',
    sidebarBackground: '#1e293b',
    textColor: '#e2e8f0',
    sidebarText: '#cbd5e1',
    hoverBackground: '#334155',
    activeBackground: '#475569',
    borderColor: '#334155',
  },
  {
    id: 'amber',
    name: '琥珀黄',
    background: '#fffdf5',
    sidebarBackground: '#fef9e7',
    textColor: '#4a3f2f',
    sidebarText: '#5c5040',
    hoverBackground: '#fdeeb8',
    activeBackground: '#fce588',
    borderColor: '#f0e2b0',
  },
];
