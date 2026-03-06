/**
 * dango-timeline Renderer
 * タイムラインデータをHTMLにレンダリング
 */

import { parseTimeline } from './parser.js';

/**
 * タイムラインのパース状態を表現するクラス
 */
class TimelineRenderer {
  constructor(options = {}) {
    this.options = {
      cssClass: options.cssClass || 'dango-timeline',
      rowSpacing: options.rowSpacing || '8px',
      ...options
    };
  }

  /**
   * タイムラインデータをHTMLテーブルに変換
   * @param {import('./parser.js').TimelineData} timelineData - パース済みタイムラインデータ
   * @returns {string} HTML テーブル
   */
  render(timelineData) {
    if (!timelineData || !timelineData.events || timelineData.events.length === 0) {
      return '';
    }

    let html = `<table class="${this.options.cssClass}">`;

    timelineData.events.forEach((event, index) => {
      const isFirst = index === 0;
      const isLast = index === timelineData.events.length - 1;

      // イベント行
      if (event.time) {
        // 時刻付きイベント
        html += `
          <tr class="dango-event-row" data-time="${event.time}">
            <td class="dango-axis"></td>
            <td class="dango-time">${event.time}</td>
            <td class="dango-content">${event.description}</td>
          </tr>`;
      } else {
        // 時刻なしイベント（宿泊先など）
        html += `
          <tr class="dango-event-row dango-no-time">
            <td class="dango-axis"></td>
            <td class="dango-content" colspan="2">${event.description}</td>
          </tr>`;
      }

      // インターバルラベル
      if (event.intervalLabel) {
        html += `
          <tr class="dango-interval-row">
            <td class="dango-axis"></td>
            <td class="dango-content dango-interval-text" colspan="2">${event.intervalLabel}</td>
          </tr>`;
      }

      // メモ行
      event.memos.forEach((memo) => {
        html += `
          <tr class="dango-memo-row">
            <td class="dango-axis"></td>
            <td class="dango-time"></td>
            <td class="dango-content dango-memo-text">${memo}</td>
          </tr>`;
      });
    });

    html += '</table>';
    return html;
  }

  /**
   * Markdownテキストをそのままレンダリング（パース + レンダリング）
   * @param {string} markdown - Markdownテキスト
   * @returns {string} HTML テーブル、またはタイムラインなし時は空文字列
   */
  renderFromMarkdown(markdown) {
    const timelineData = parseTimeline(markdown);
    return timelineData ? this.render(timelineData) : '';
  }
}

/**
 * 便利な静的メソッド
 */

/**
 * Markdownをそのままレンダリング（シンプルAPI）
 * @param {string} markdown - Markdownテキスト
 * @param {Object} options - レンダラーオプション
 * @returns {string} HTML テーブル
 */
export function render(markdown, options = {}) {
  const renderer = new TimelineRenderer(options);
  return renderer.renderFromMarkdown(markdown);
}

/**
 * パース済みデータをレンダリング
 * @param {import('./parser.js').TimelineData} timelineData - パース済みデータ
 * @param {Object} options - レンダラーオプション
 * @returns {string} HTML テーブル
 */
export function renderData(timelineData, options = {}) {
  const renderer = new TimelineRenderer(options);
  return renderer.render(timelineData);
}

/**
 * クラスのエクスポート
 */
export { TimelineRenderer };
