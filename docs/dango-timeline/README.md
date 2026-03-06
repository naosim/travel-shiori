# 🍡 dango-timeline

Markdown駆動の**シンプルで美しいタイムラインコンポーネント**です。

団子のように**丸と線でつながった**レイアウトで、時系列データを直感的に表現します。

![dango-timeline example](./example.png)

## ✨ 特徴

- **Markdown駆動**: `HH:mm 行程名` 形式でシンプルに記述
- **フレームワーク非依存**: Vanilla JavaScript (バニラJS)
- **印刷最適化**: CSS内にプリント設定を内包
- **カスタマイズ可能**: CSS変数で見た目を柔軟に調整
- **軽量**: 依存なし、ファイルサイズが小さい

## 📦 インストール

### NPMから

```bash
npm install dango-timeline
```

### CDNから（今後対応予定）

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/dango-timeline@latest/src/styles.css">
<script type="module">
  import { render } from 'https://cdn.jsdelivr.net/npm/dango-timeline@latest/src/index.js';
  const html = render(markdownText);
  document.getElementById('timeline').innerHTML = html;
</script>
```

## 🏗️ アーキテクチャ・CSS 配布戦略（重要）

**dango-timeline は2つの利用方法とそれぞれ異なる CSS 配布方法を持っています。**

### どちらを選ぶべきか

| 利用シーン | 推奨 | 入り口 |
|----------|------|--------|
| **ローカル HTML、フレームワーク不要** | IIFE版 | `dist/dango-timeline.js` |
| **Node.js/バンドラー環境、ES Module** | ES Module版 | `src/index.js` (`npm install`) |

### 🎯 CSS 管理の原則

**重要：CSS は「ただ1つの場所」から供給される必要があります** ⚠️

#### パターン1: IIFE版を使う場合（ローカルファイル推奨）
```html
<script src="./dango-timeline/dist/dango-timeline.js"></script>
<script>
  // ✅ これだけで OK：CSS が自動インジェクトされる
  DangoTimeline.injectStyles();
  const html = DangoTimeline.render(markdown);
</script>

<!-- ❌ 以下は不要・重複になるため削除 -->
<!-- <link rel="stylesheet" href="./dango-timeline/src/styles.css"> -->
```

**理由**：
- `dist/dango-timeline.js` は CSS を内部に埋め込んでいます
- `DangoTimeline.injectStyles()` で自動挿入されるため、外部から CSS ファイルを link する必要はありません
- 外部から別途 link すれば CSS の重複定義になります

#### パターン2: ES Module版を使う場合（NPM 環境）
```javascript
import { render } from 'dango-timeline';
import 'dango-timeline/styles'; // ← CSS を明示的に import

const html = render(markdown);
```

**理由**：
- バンドラーが CSS を最適化・圧縮するため効率的
- `import` 主義で管理が明確

### 👥 他の AI や開発者向けメモ

このライブラリを統合する際は、**必ず以下を確認してください**：

1. **IIFE版（dist）を使う場合**
   - 外部から CSS ファイルを link しない
   - `DangoTimeline.injectStyles()` を初期化時に呼び出す
   - CSS クラス（.dango-timeline 等）をHTML に**硬コードしない**

2. **ES Module版（src）を使う場合**
   - `src/styles.css` を `import` で読み込む
   - 他ファイルで同じ CSS クラスを定義しない（重複防止）

3. **統合テンプレート**
   ```javascript
   // ✅ GOOD: IIFE版の正しい使用方法
   import { render } from 'dango-timeline';
   DangoTimeline.injectStyles();
   const html = DangoTimeline.render(markdown);
   
   // ❌ BAD: CSS の重複
   import styles from 'dango-timeline/styles.css';
   const html = DangoTimeline.render(markdown); // styles も既に埋め込まれてる
   ```

## 🚀 使い方


### 1. グローバル版（IIFE）- HTML内で直接使用

ローカルファイルとして開く場合や、モジュールを避けたい場合：

```html
<!DOCTYPE html>
<html>
<head>
  <script src="./dist/dango-timeline.js"></script>
</head>
<body>
  <div id="timeline"></div>
  <script>
    // スタイルをインジェクト（初回のみ）
    DangoTimeline.injectStyles();

    // Markdownをレンダリング
    const markdown = `10:00 駅出発
  - | 電車で移動
10:30 ホテル到着`;

    const html = DangoTimeline.render(markdown);
    document.getElementById('timeline').innerHTML = html;
  </script>
</body>
</html>
```

**API:**
```javascript
DangoTimeline.render(markdown, options)      // Markdown → HTML
DangoTimeline.parseTimeline(markdown)        // Markdown → JSON
DangoTimeline.injectStyles()                 // CSSをヘッドに追加
DangoTimeline.setStyle('line-width', '2pt')  // CSS変数をカスタマイズ
```

### 2. ES Module版 - Node.js/バンドラー環境

```javascript
import { render } from 'dango-timeline';

const markdown = `
10:00 駅出発
  - | 電車で移動30分
  - 乗車時間30分
10:30 ホテル到着
11:00 チェックイン
`;

const html = render(markdown);
document.getElementById('timeline-container').innerHTML = html;
```

**インストール:**
```bash
npm install dango-timeline
```

### ES Module版 - パース + レンダリングの分離

より細かい制御が必要な場合：

```javascript
import { parseTimeline, renderData } from 'dango-timeline';

const data = parseTimeline(markdownText);
console.log(data); // { events: [...] }

const html = renderData(data, {
  cssClass: 'my-timeline',
  rowSpacing: '10px'
});
```

### CSSのカスタマイズ

```html
<style>
  :root {
    --dango-line-width: 2pt;          /* 縦線の太さ */
    --dango-line-color: #e74c3c;      /* 縦線の色 */
    --dango-dot-size: 11px;           /* 丸の大きさ */
    --dango-time-width: 60px;         /* 時刻欄の幅 */
    --dango-row-spacing: 10px;        /* 行間 */
  }
</style>

<link rel="stylesheet" href="node_modules/dango-timeline/src/styles.css">
```

## 📝 Markdown記法

### 基本：時刻付きイベント

```markdown
10:00 駅出発
10:30 ホテル到着
```

### インターバルラベル（移動手段など）

前のイベントと次のイベントの間に説明を入れます：

```markdown
10:00 駅出発
  - | 電車グリーン車で移動（30分）
10:30 ホテル到着
```

### メモ行

イベントの詳細情報：

```markdown
10:00 駅出発
  - Suicaでタッチ
  - 駅弁を購入
10:30 ホテル到着
```

### 時刻なしイベント

宿泊先など、時刻がないイベント：

```markdown
10:00 駅出発
🏨 ホテルプラーザ（宿泊）
08:00 朝食
```

## 📚 API リファレンス

### `parseTimeline(markdown)`

Markdownテキストをタイムラインデータ構造に解析します。

**パラメータ:**
- `markdown` (string): Markdown形式のテキスト

**返値:**
- `TimelineData | null`: パース済みタイムラインオブジェクト、またはタイムラインを含まない場合は `null`

**例:**
```javascript
const data = parseTimeline('10:00 出発\n10:30 到着');
// { events: [
//   { time: '10:00', description: '出発', memos: [], intervalLabel: null },
//   { time: '10:30', description: '到着', memos: [], intervalLabel: null }
// ] }
```

### `hasTimeline(markdown)`

Markdownにタイムライン（時刻が記載されている）が存在するかチェックします。

**パラメータ:**
- `markdown` (string): Markdown形式のテキスト

**返値:**
- `boolean`: タイムラインが存在する場合は `true`

### `render(markdown, options)`

Markdownをそのまま（パース+レンダリング）HTMLに変換します。

**パラメータ:**
- `markdown` (string): Markdown形式のテキスト
- `options` (object, optional): レンダラーオプション
  - `cssClass` (string): カスタムCSSクラス名（デフォルト: `'dango-timeline'`）
  - `rowSpacing` (string): 行間（デフォルト: `'8px'`）

**返値:**
- `string`: HTMLテーブル

### `renderData(timelineData, options)`

パース済みタイムラインデータをHTMLに変換します。

**パラメータ:**
- `timelineData` (TimelineData): `parseTimeline()` の出力
- `options` (object, optional): レンダラーオプション

**返値:**
- `string`: HTMLテーブル

### `TimelineRenderer` クラス

より高度な制御が必要な場合、直接クラスをインスタンス化できます。

```javascript
import { TimelineRenderer } from 'dango-timeline/renderer';

const renderer = new TimelineRenderer({
  cssClass: 'custom-timeline',
  rowSpacing: '12px'
});

const html = renderer.renderFromMarkdown(markdownText);
```

## 📋 Package.json エントリーポイント一覧

各エントリーポイントは明確に用途が分かれています：

| エントリー | ファイル | 用途 | CSS | 備考 |
|-----------|---------|------|-----|------|
| `.`（デフォルト） | `src/index.js` | ES Module版（Node.js） | 外部 | `import { render } from 'dango-timeline'` |
| `./dist` | `dist/dango-timeline.js` | IIFE版（ブラウザ直接） | **内部埋め込み** | グローバルスコープ `DangoTimeline` を使用 |
| `./styles` | `src/styles.css` | CSSのみ | - | ES Module版と組み合わせる |
| `./parser` | `src/parser.js` | パーサーのみ | - | 高度なカスタマイズ向け |
| `./renderer` | `src/renderer.js` | レンダラーのみ | - | 高度なカスタマイズ向け |

**重要：IIFE版（`./dist`）を使う場合、`./styles` は不要です**

## 🎨 スタイル構成

タイムラインのデザインはCSS変数で制御されます：

| 変数 | デフォルト | 説明 |
|------|---------|------|
| `--dango-row-spacing` | `8px` | 行間の余白 |
| `--dango-time-width` | `55px` | 時刻欄の幅 |
| `--dango-axis-width` | `25px` | 軸（縦線）のカラム幅 |
| `--dango-line-width` | `1.5pt` | 縦線の太さ |
| `--dango-dot-size` | `9px` | 丸（ドット）のサイズ |
| `--dango-line-color` | `#000` | 縦線と丸の色 |

## 🖨️ 印刷対応

- 背景グラフィックスが正確に印刷されます
- CSS内に印刷プリセットが含まれます
- A4横向き・両面印刷に最適化済み

## 📄 ライセンス

MIT

## 🏠 リポジトリ

https://github.com/naosim/travel-shiori

---

## ✅ 統合チェックリスト（開発者・AI向け）

このライブラリを他のプロジェクトで使う際は、以下を確認してください：

### IIFE版（`dist/dango-timeline.js`）を使う場合
- [ ] `<script src="...dango-timeline.js"></script>` で読み込んだ
- [ ] `DangoTimeline.injectStyles()` を初期化時に呼び出している
- [ ] **同じ名前の `.dango-*` CSS クラスを別ファイルで定義していない**
- [ ] `<link rel="stylesheet" href="...styles.css">` のような外部 CSS link がない
- [ ] HTML に `<table class="dango-timeline">` などを手動書き込みしていない（常に `DangoTimeline.render()` の出力から生成）

### ES Module版（`src/index.js`）を使う場合
- [ ] `import 'dango-timeline/styles'` で CSS をインポートしている
- [ ] 他ファイルで `.dango-*` クラスを定義していない
- [ ] `package.json` の `"type": "module"` または バンドラーが ES Module に対応している

### 共通
- [ ] タイムラインの Markdown 構文ドキュメントを読んだ（`HH:mm`, インターバルラベル、メモ形式）
- [ ] CSS 変数（`--dango-line-width` など）のカスタマイズが必要ならそれのみ

---

**Made with ❤️ for travel planning**

