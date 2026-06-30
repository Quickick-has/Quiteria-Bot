import { spawn, spawnSync } from 'node:child_process';

let _resolvedBinary = null;

function tryCommand(cmd, args = ['--version']) {
	try {
		const res = spawnSync(cmd, args, { stdio: 'ignore' });
		return res.status === 0;
	} catch {
		return false;
	}
}

export function getYtDlpBinary() {
	if (_resolvedBinary) return _resolvedBinary;

	// 1) explicit override
	if (process.env.YTDLP_BIN) {
		_resolvedBinary = process.env.YTDLP_BIN;
		return _resolvedBinary;
	}

	// 2) try system `yt-dlp` in PATH (apt, pip install --user, pipx, etc.)
	if (tryCommand('yt-dlp')) {
		_resolvedBinary = 'yt-dlp';
		return _resolvedBinary;
	}

	// 3) try `python3 -m yt_dlp` (works on any arch via pip, no native binary needed)
	if (tryCommand('python3', ['-m', 'yt_dlp', '--version'])) {
		_resolvedBinary = { cmd: 'python3', prefixArgs: ['-m', 'yt_dlp'] };
		return _resolvedBinary;
	}

	// 4) fallback to bundled static binary — import lazily so a missing
	//    prebuilt binary for this arch (e.g. linux-arm64) doesn't crash
	//    the whole module at import time.
	try {
		// eslint-disable-next-line global-require
		const ytDlpPath = require('yt-dlp-static');
		_resolvedBinary = ytDlpPath;
		return _resolvedBinary;
	} catch (e) {
		throw new Error(
			'No yt-dlp binary available: not found in PATH, no python3 -m yt_dlp, ' +
			'and yt-dlp-static has no prebuilt binary for this platform/arch. ' +
			'Install yt-dlp manually (e.g. `pip install yt-dlp` or `pipx install yt-dlp`) ' +
			'or set YTDLP_BIN to a valid binary path.'
		);
	}
}

function runYtDlp(args) {
	const binary = getYtDlpBinary();
	const isObj = typeof binary === 'object';
	const cmd = isObj ? binary.cmd : binary;
	let finalArgs = isObj ? [...binary.prefixArgs, ...args] : [...args];

	if (process.env.YTDLP_COOKIES_FILE) {
		finalArgs.push('--cookies', process.env.YTDLP_COOKIES_FILE);
	} else if (process.env.YTDLP_COOKIES_FROM_BROWSER) {
		finalArgs.push('--cookies-from-browser', process.env.YTDLP_COOKIES_FROM_BROWSER);
	}

	return new Promise((resolve, reject) => {
		const yt = spawn(cmd, finalArgs);

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