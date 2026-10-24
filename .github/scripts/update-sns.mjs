// YouTubeチャンネルの最新動画を取得して sns-latest.json に書き出す（GitHub Actionsから1時間ごとに実行）
import { readFile, writeFile } from 'node:fs/promises';

const CHANNEL_ID = 'UCvNEQeKGS4KNWk99_RIA6YA';
const OUT = 'sns-latest.json';

const decode = s => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&amp;/g, '&');

const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`);
if (!res.ok) throw new Error(`YouTube feed: HTTP ${res.status}`);
const entry = (await res.text()).split('<entry>')[1];
if (!entry) throw new Error('YouTube feed: no videos');

const pick = tag => (entry.match(new RegExp(`<${tag}>([^<]*)</${tag}>`)) || [])[1] || '';
const youtube = { id: pick('yt:videoId'), title: decode(pick('title')), published: pick('published') };

const next = JSON.stringify({ youtube }, null, 2) + '\n';
const prev = await readFile(OUT, 'utf8').catch(() => '');
if (next !== prev) {
  await writeFile(OUT, next);
  console.log('updated:', youtube.title);
} else {
  console.log('no change');
}
