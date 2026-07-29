import katex from 'katex';
import { marked } from 'marked';

// Cấu hình marked để không render lỗi ký tự đặc biệt
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Render chuỗi chứa text thường, Markdown và LaTeX (cả inline và block) sang HTML.
 * @param {string} text - Chuỗi văn bản cần render
 * @returns {string} - Chuỗi HTML kết quả
 */
export function renderMarkdownWithMath(text) {
  if (!text) return '';

  let processedText = text;

  // 1. Thay thế Block Math: $$ ... $$
  // Regex khớp mọi cụm nằm giữa cặp $$
  const displayMathRegex = /\$\$([\s\S]*?)\$\$/g;
  processedText = processedText.replace(displayMathRegex, (match, math) => {
    try {
      // Decode ký tự HTML nếu có (như &lt; thành <)
      const cleanMath = math
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      return `<div class="katex-display">${katex.renderToString(cleanMath, { displayMode: true, throwOnError: false, output: 'html' })}</div>`;
    } catch (err) {
      console.error('Lỗi render Block Math:', err);
      return `<span class="text-danger">${match}</span>`;
    }
  });

  // 2. Thay thế Inline Math: $ ... $
  // Regex khớp mọi cụm nằm giữa cặp $ (không chứa $)
  const inlineMathRegex = /\$([^$\n]+?)\$/g;
  processedText = processedText.replace(inlineMathRegex, (match, math) => {
    try {
      const cleanMath = math
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      return katex.renderToString(cleanMath, { displayMode: false, throwOnError: false, output: 'html' });
    } catch (err) {
      console.error('Lỗi render Inline Math:', err);
      return `<span class="text-danger">${match}</span>`;
    }
  });

  // 3. Render các phần còn lại bằng Marked (Markdown)
  try {
    return marked.parse(processedText);
  } catch (err) {
    console.error('Lỗi render Markdown:', err);
    return processedText;
  }
}
