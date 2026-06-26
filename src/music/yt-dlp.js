import { spawn, spawnSync } from 'node:child_process';
import ytDlpPath from 'yt-dlp-static';

let _resolvedBinary = null;

export function getYtDlpBinary() {
	if (_resolvedBinary) return _resolvedBinary;

	// 1) explicit override
	if (process.env.YTDLP_BIN) {
		_resolvedBinary = process.env.YTDLP_BIN;
		return _resolvedBinary;
	}

	// 2) try system `yt-dlp` in PATH
	try {
		const res = spawnSync('yt-dlp', ['--version'], { stdio: 'ignore' });
		if (res.status === 0) {
			_resolvedBinary = 'yt-dlp';
			return _resolvedBinary;
		}
	} catch (e) {
		// ignore
	}

	// 3) fallback to bundled static binary
	_resolvedBinary = ytDlpPath;
	return _resolvedBinary;
}

function runYtDlp(args) {
	const binaryPath = getYtDlpBinary();
	const finalArgs = [...args];

	if (process.env.YTDLP_COOKIES_FILE) {
		finalArgs.unshift('--cookies', process.env.YTDLP_COOKIES_FILE);
	} else if (process.env.YTDLP_COOKIES_FROM_BROWSER) {
		finalArgs.unshift('--cookies-from-browser', process.env.YTDLP_COOKIES_FROM_BROWSER);
	}

	return new Promise((resolve, reject) => {
		const yt = spawn(binaryPath, finalArgs);

		let output = '';
		let errorOutput = '';

		yt.stdout.on('data', (data) => {
			output += data.toString();
		});

		yt.stderr.on('data', (data) => {
			errorOutput += data.toString();
		});

		yt.on('close', (code) => {
			if (code !== 0 && !output.trim()) {
				reject(new Error(errorOutput.trim() || `yt-dlp exited with code ${code}`));
				return;
			}

			try {
				resolve(JSON.parse(output));
			} catch (err) {
				reject(err);
			}
		});

		yt.on('error', reject);
	});
}

function hasAudioFormats(info) {
	const formats = Array.isArray(info?.formats) ? info.formats : [];
	return formats.some((format) => format?.url && format.acodec && format.acodec !== 'none');
}

export function searchYT(query) {
	return runYtDlp(['--flat-playlist', '--dump-single-json', `ytsearch1:${query}`]);
}

export function extractYT(url) {
	const clients = ['android_music', 'android', 'mweb', 'web'];

	return (async () => {
		let lastError = null;

		for (const client of clients) {
			try {
				const info = await runYtDlp(['--extractor-args', `youtube:player_client=${client}`, '--dump-json', url]);
				if (hasAudioFormats(info)) {
					return info;
				}
				lastError = new Error(`yt-dlp returned no audio formats with player_client=${client}`);
			} catch (error) {
				lastError = error;
			}
		}

		throw lastError || new Error('yt-dlp could not extract audio formats');
	})();
}

export default searchYT;
