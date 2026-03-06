/**
 * dango-timeline Parser
 * Markdown テキストをタイムラインデータ構造にパース
 */

/**
 * タイムラインイベントのデータ構造
 * @typedef {Object} TimelineEvent
 * @property {string} time - 時刻（HH:mm形式、フォーマット済み）
 * @property {string} description - イベントの説明文
 * @property {string[]} memos - サブメモ配列
 * @property {string|null} intervalLabel - 次のイベントへのインターバルラベル
 */

/**
 * タイムラインデータの構造
 * @typedef {Object} TimelineData
 * @property {TimelineEvent[]} events - イベント配列
 */

/**
 * Markdownテキストをタイムラインデータにパース
 * @param {string} text - Markdownテキスト
 * @returns {TimelineData|null} パース後のタイムラインデータ、または null（タイムラインなし）
 */
export function parseTimeline(text) {
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
export function hasTimeline(text) {
  return /\d{1,2}:\d{2}/.test(text);
}
