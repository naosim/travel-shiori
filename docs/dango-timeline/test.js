/**
 * dango-timeline Tests
 */

import assert from 'assert';
import { parseTimeline, hasTimeline, render } from './src/index.js';

console.log('🧪 Running dango-timeline tests...\n');

// Test 1: parseTimeline - 基本的なテイムラインパース
{
  const markdown = `10:00 駅出発
10:30 ホテル到着`;
  
  const result = parseTimeline(markdown);
  assert.ok(result, 'should return non-null for timeline');
  assert.equal(result.events.length, 2, 'should parse 2 events');
  assert.equal(result.events[0].time, '10:00', 'first event time');
  assert.equal(result.events[0].description, '駅出発', 'first event description');
  console.log('✅ Test 1 passed: Basic timeline parsing');
}

// Test 2: parseTimeline - インターバルラベル付き
{
  const markdown = `10:00 駅出発
  - | 電車で移動
10:30 ホテル到着`;
  
  const result = parseTimeline(markdown);
  assert.equal(result.events[0].intervalLabel, '電車で移動', 'should parse interval label');
  console.log('✅ Test 2 passed: Interval label parsing');
}

// Test 3: parseTimeline - メモ行
{
  const markdown = `10:00 駅出発
  - Suicaでタッチ
  - 駅弁を購入
10:30 ホテル到着`;
  
  const result = parseTimeline(markdown);
  assert.equal(result.events[0].memos.length, 2, 'should parse 2 memos');
  assert.equal(result.events[0].memos[0], 'Suicaでタッチ', 'first memo');
  console.log('✅ Test 3 passed: Memo parsing');
}

// Test 4: parseTimeline - 時刻なしイベント
{
  const markdown = `10:00 駅出発
- 🏨 ホテル到着（宿泊）
08:00 朝食`;
  
  const result = parseTimeline(markdown);
  const noTimeEvent = result.events.find(e => e.time === null);
  assert.ok(noTimeEvent, 'should have event without time');
  assert.ok(noTimeEvent.description.includes('ホテル'), 'description should match');
  console.log('✅ Test 4 passed: No-time event parsing');
}

// Test 5: hasTimeline
{
  assert.ok(hasTimeline('10:00 event'), 'should detect timeline');
  assert.ok(!hasTimeline('no timeline here'), 'should not detect timeline');
  console.log('✅ Test 5 passed: hasTimeline detection');
}

// Test 6: render - HTML生成
{
  const markdown = `10:00 駅出発
10:30 ホテル到着`;
  
  const html = render(markdown);
  assert.ok(html.includes('<table'), 'should generate table');
  assert.ok(html.includes('class="dango-timeline"'), 'should have timeline class');
  assert.ok(html.includes('10:00'), 'should include time');
  assert.ok(html.includes('駅出発'), 'should include description');
  console.log('✅ Test 6 passed: HTML rendering');
}

// Test 7: 空のマークダウン
{
  const result = parseTimeline('');
  assert.strictEqual(result, null, 'should return null for empty string');
  console.log('✅ Test 7 passed: Empty markdown handling');
}

// Test 8: 時刻形式の柔軟性（頃）
{
  const markdown = `10:00頃 駅出発
13:30 昼食`;
  
  const result = parseTimeline(markdown);
  assert.equal(result.events[0].time, '10:00頃', 'should parse time with 頃');
  console.log('✅ Test 8 passed: Time format flexibility');
}

// Test 9: マークダウンボールディング削除
{
  const markdown = `10:00 **駅出発**`;
  
  const result = parseTimeline(markdown);
  assert.equal(result.events[0].description, '駅出発', 'should strip ** formatting');
  console.log('✅ Test 9 passed: Bold formatting removal');
}

// Test 10: HTML内の特殊文字の保護
{
  const markdown = `10:00 駅 & ホテル出発`;
  
  const html = render(markdown);
  assert.ok(html.includes('駅 & ホテル出発'), 'should preserve special chars');
  console.log('✅ Test 10 passed: Special character handling');
}

console.log('\n🎉 All tests passed!');
