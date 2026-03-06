/**
 * dango-timeline - Main Entry Point
 * 団子のように丸と線でつながったタイムラインコンポーネント
 * 
 * @example
 * import { parseTimeline, render } from 'dango-timeline';
 * 
 * // Markdownから直接レンダリング
 * const html = render(markdownText);
 * 
 * // またはパースしてからレンダリング
 * const data = parseTimeline(markdownText);
 * const html = renderData(data);
 */

export { parseTimeline, hasTimeline } from './parser.js';
export { render, renderData, TimelineRenderer } from './renderer.js';

// CSSの自動インジェクション（オプション）
// ユーザーが明示的にCSSをインポートすることも可能
export function injectStyles() {
  if (typeof document !== 'undefined' && !document.getElementById('dango-timeline-styles')) {
    const style = document.createElement('style');
    style.id = 'dango-timeline-styles';
    style.textContent = require('./styles.css').default;
    document.head.appendChild(style);
  }
}
