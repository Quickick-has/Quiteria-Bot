import { extractYT } from '../src/music/yt-dlp.js';

const target = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

try {
  const info = await extractYT(target);
  const formats = Array.isArray(info.formats) ? info.formats : [];
  const audio = formats.find((f) => f && f.url && f.acodec && f.acodec !== 'none');

  console.log('title:', info.title || 'none');
  console.log('formats:', formats.length);
  console.log('audio:', audio ? 'yes' : 'no');
} catch (error) {
  console.error('extract-error:', error.message || error);
  process.exit(1);
}
