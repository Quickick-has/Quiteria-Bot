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

	// 2) system `yt-dlp` in PATH
	if (tryCommand('yt-dlp')) {
		_resolvedBinary = 'yt-dlp';
		return _resolvedBinary;
	}

	throw new Error(
		'yt-dlp não encontrado no PATH. Verifique se o binário foi instalado ' +
			'corretamente no Dockerfile, ou defina YTDLP_BIN com o caminho completo.'
	);
}

function runYtDlp(args) {
	const binaryPath = getYtDlpBinary();
	const finalArgs = [...args];

	if (process.env.YTDLP_COOKIES_FILE) {
		finalArgs.push('--cookies', process.env.YTDLP_COOKIES_FILE);
	} else if (process.env.YTDLP_COOKIES_FROM_BROWSER) {
		finalArgs.push('--cookies-from-browser', process.env.YTDLP_COOKIES_FROM_BROWSER);
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