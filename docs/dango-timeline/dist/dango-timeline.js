/**
 * dango-timeline
 * 🍡 Markdown駆動のシンプルで美しいタイムラインコンポーネント
 * グローバルスコープ版 (IIFE)
 * 
 * Usage:
 * <script src="dango-timeline.js"></script>
 * <script>
 *   const html = DangoTimeline.render(markdownText);
 *   document.getElementById('timeline').innerHTML = html;
 * </script>
 */

(function (global) {
  'use strict';

  /**
   * Markdownテキストをタイムラインデータにパース
   * @param {string} text - Markdownテキスト
   * @returns {Object|null} パース後のタイムラインデータ、または null
   */
  function parseTimeline(text) {
    if (!text) return null;

    const lines = text.split('\n');
    const events = [];
    let currentEvent = null;
    let foundFirstEvent = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // 空行スキップ
      if (!trimmed) continue;

      // 時刻パターン: HH:mm または HH:mm頃
      const timeMatch = trimmed.match(/^[-*]?\s*(\d{1,2}:\d{2}(頃)?)/);

      if (timeMatch) {
        // 前のイベントを保存
        if (currentEvent) {
          events.push(currentEvent);
        }

        foundFirstEvent = true;

        // 新しいイベントを作成
        const description = trimmed
          .replace(/^[-*]?\s*/, '')
          .replace(timeMatch[1], '')
          .replace(/\*\*/g, '')
          .trim();

        currentEvent = {
          time: timeMatch[1],
          description: description,
          memos: [],
          intervalLabel: null
        };
      } else if (foundFirstEvent && currentEvent) {
        // タイムライン内のメモ、インターバルラベルなどを処理

        // インターバルラベル: 「  - | 移動手段」形式
        if (trimmed.includes('|')) {
          const labelMatch = trimmed.split('|');
          if (labelMatch.length > 1) {
            currentEvent.intervalLabel = labelMatch[1].trim();
          }
        }
        // メモ: 「  - メモ」形式（インデント必須）
        else if ((line.startsWith('  -') || line.startsWith('    -')) && !timeMatch) {
          const memoText = trimmed
            .replace(/^[-*]\s*/, '')
            .replace(/\*\*/g, '');
          currentEvent.memos.push(memoText);
        }
        // 時刻なしのイベント: 「- 宿泊先」形式（インデントなし）
        else if (trimmed.startsWith('-') && !timeMatch && !line.startsWith('  ')) {
          // 前のイベントを保存
          if (currentEvent) {
            events.push(currentEvent);
          }
          foundFirstEvent = true;
          const description = trimmed
            .replace(/^-?\s*/, '')
            .replace(/\*\*/g, '');
          currentEvent = {
            time: null,
            description: description,
            memos: [],
            intervalLabel: null
          };
        }
      }
    }

    // 最後のイベントを保存
    if (currentEvent) {
      events.push(currentEvent);
    }

    return events.length > 0 ? { events } : null;
  }

  /**
   * タイムラインが存在するかチェック
   * @param {string} text - Markdownテキスト
   * @returns {boolean}
   */
  function hasTimeline(text) {
    return /\d{1,2}:\d{2}/.test(text);
  }

  /**
   * タイムラインのレンダラークラス
   */
  function TimelineRenderer(options) {
    options = options || {};
    this.options = {
      cssClass: options.cssClass || 'dango-timeline',
      rowSpacing: options.rowSpacing || '8px'
    };
  }

  /**
   * タイムラインデータをHTMLテーブルに変換
   */
  TimelineRenderer.prototype.render = function (timelineData) {
    if (!timelineData || !timelineData.events || timelineData.events.length === 0) {
      return '';
    }

    let html = '<table class="' + this.options.cssClass + '">';

    timelineData.events.forEach((event, index) => {
      const isFirst = index === 0;
      const isLast = index === timelineData.events.length - 1;

      // イベント行
      if (event.time) {
        // 時刻付きイベント
        html += '\n          <tr class="dango-event-row" data-time="' + event.time + '">';
        html += '\n            <td class="dango-axis"></td>';
        html += '\n            <td class="dango-time">' + event.time + '</td>';
        html += '\n            <td class="dango-content">' + event.description + '</td>';
        html += '\n          </tr>';
      } else {
        // 時刻なしイベント（宿泊先など）
        html += '\n          <tr class="dango-event-row dango-no-time">';
        html += '\n            <td class="dango-axis"></td>';
        html += '\n            <td class="dango-content" colspan="2">' + event.description + '</td>';
        html += '\n          </tr>';
      }

      // インターバルラベル
      if (event.intervalLabel) {
        html += '\n          <tr class="dango-interval-row">';
        html += '\n            <td class="dango-axis"></td>';
        html += '\n            <td class="dango-content dango-interval-text" colspan="2">' + event.intervalLabel + '</td>';
        html += '\n          </tr>';
      }

      // メモ行
      event.memos.forEach((memo) => {
        html += '\n          <tr class="dango-memo-row">';
        html += '\n            <td class="dango-axis"></td>';
        html += '\n            <td class="dango-time"></td>';
        html += '\n            <td class="dango-content dango-memo-text">' + memo + '</td>';
        html += '\n          </tr>';
      });
    });

    html += '\n        </table>';
    return html;
  };

  /**
   * Markdownテキストをそのままレンダリング
   */
  TimelineRenderer.prototype.renderFromMarkdown = function (markdown) {
    const timelineData = parseTimeline(markdown);
    return timelineData ? this.render(timelineData) : '';
  };

  /**
   * 公開API
   */
  const DangoTimeline = {
    // パーサー
    parseTimeline: parseTimeline,
    hasTimeline: hasTimeline,

    // 簡単なレンダリング関数
    render: function (markdown, options) {
      const renderer = new TimelineRenderer(options);
      return renderer.renderFromMarkdown(markdown);
    },

    // より細かい制御が必要な場合
    renderData: function (timelineData, options) {
      const renderer = new TimelineRenderer(options);
      return renderer.render(timelineData);
    },

    // クラスの公開（高度な使用方法向け）
    TimelineRenderer: TimelineRenderer,

    // CSS変数のカスタマイズヘルパー
    setStyle: function (varName, value) {
      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--dango-' + varName, value);
      }
    },

    // スタイル定義を動的にインジェクト
    injectStyles: function () {
      if (typeof document === 'undefined' || document.getElementById('dango-timeline-styles')) {
        return;
      }

      const style = document.createElement('style');
      style.id = 'dango-timeline-styles';
      style.textContent = `
:root {
  --dango-row-spacing: 8px;
  --dango-time-width: 55px;
  --dango-axis-width: 25px;
  --dango-line-width: 1.5pt;
  --dango-dot-size: 9px;
  --dango-line-color: #000;
}

.dango-timeline {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.dango-axis {
  width: var(--dango-axis-width);
  position: relative;
  padding: 0;
  vertical-align: middle;
}

.dango-axis::before {
  content: '';
  position: absolute;
  right: calc(var(--dango-line-width) * -0.5);
  top: 0;
  bottom: 0;
  width: var(--dango-line-width);
  background: var(--dango-line-color);
  z-index: 1;
}

.dango-timeline tr:first-child .dango-axis::before {
  top: 56%;
}

.dango-timeline tr:last-child .dango-axis::before {
  bottom: 44%;
}

.dango-event-row .dango-axis::after {
  content: '';
  position: absolute;
  right: calc(var(--dango-line-width) * -0.5);
  top: 56%;
  width: var(--dango-dot-size);
  height: var(--dango-dot-size);
  background: #fff;
  border: var(--dango-line-width) solid var(--dango-line-color);
  border-radius: 50%;
  transform: translate(50%, -50%);
  z-index: 2;
}

.dango-time {
  width: var(--dango-time-width);
  padding: var(--dango-row-spacing) 5px var(--dango-row-spacing) 10px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 10.5pt;
  vertical-align: top;
  white-space: nowrap;
  line-height: 1.4;
}

.dango-content {
  padding: var(--dango-row-spacing) 0 var(--dango-row-spacing) 10px;
  vertical-align: top;
  text-align: left;
  font-size: 9.5pt;
  line-height: 1.4;
}

.dango-memo-row .dango-content {
  padding-top: 0;
  padding-bottom: 3px;
}

.dango-memo-row .dango-time {
  padding-top: 0;
  padding-bottom: 3px;
}

.dango-memo-text {
  font-size: 8.5pt;
  color: #444;
  display: block;
}

.dango-interval-text {
  font-size: 8pt;
  color: #333;
  padding: 4px 0 4px 15px;
  position: relative;
}

.dango-interval-text::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 10px;
  height: 0.5pt;
  background: #999;
}

.dango-event-row.dango-no-time .dango-content {
  font-weight: 500;
}

@media print {
  .dango-timeline {
    break-inside: avoid;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
      `;
      document.head.appendChild(style);
    }
  };

  // グローバルスコープに公開
  if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境
    module.exports = DangoTimeline;
  } else {
    // ブラウザ環境
    global.DangoTimeline = DangoTimeline;
  }

})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
