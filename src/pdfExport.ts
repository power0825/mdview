export interface PdfExportOptions {
  margin: [number, number, number, number];
  filename: string;
  image: {
    type: 'jpeg';
    quality: number;
  };
  html2canvas: {
    scale: number;
    useCORS: boolean;
    scrollY: number;
  };
  jsPDF: {
    unit: string;
    format: string;
    orientation: 'portrait';
  };
  pagebreak: {
    mode: Array<'css' | 'legacy'>;
    avoid: string[];
  };
}

export function createPdfExportOptions(markdownFileName: string): PdfExportOptions {
  return {
    margin: [10, 10, 10, 10],
    filename: `${markdownFileName.replace(/\.(md|markdown)$/i, '')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: {
      mode: ['css', 'legacy'],
      avoid: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'pre',
        'blockquote',
        'table',
        'img',
        'li',
      ],
    },
  };
}
