import { joinVoiceChannel, createAudioPlayer, createAudioResource, demuxProbe, NoSubscriberBehavior, AudioPlayerStatus, entersState, VoiceConnectionStatus } from '@discordjs/voice';
import { Readable } from 'node:stream';
import { searchYT, extractYT } from './yt-dlp.js';
import MusicQueue from './queue.js';

export default class Player {
	constructor(guildId) {
		this.guildId = guildId;
		this.connection = null;
		this.player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
		this.queue = new MusicQueue();
		this.current = null;

		this.player.on('stateChange', (oldState, newState) => {
			if (newState.status === AudioPlayerStatus.Idle) {
				this.current = null;
				if (!this.queue.isEmpty()) this.playNext();
			}
		});
	}

	async join(voiceChannel) {
		if (!voiceChannel) throw new Error('Voice channel not found');
		this.connection = joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: voiceChannel.guild.id,
			adapterCreator: voiceChannel.guild.voiceAdapterCreator,
		});

		this.connection.subscribe(this.player);
		try {
			await entersState(this.connection, VoiceConnectionStatus.Ready, 20_000);
		} catch (e) {
			console.warn('Voice connection not ready:', e.message || e);
		}
	}

	async enqueue(query, voiceChannel, requester) {
		const track = await this.resolveTrack(query, requester);
		const isUrl = (() => {
			try {
				new URL(query);
				return true;
			} catch {
				return false;
			}
		})();

		this.queue.push(track);
		if (this.player.state.status === AudioPlayerStatus.Idle && !this.current) {
			await this.playNext(voiceChannel);
		}

		return track;
	}

	async resolveTrack(query, requester) {
		const isUrl = this.isUrl(query);
		const info = isUrl ? await extractYT(query) : await searchYT(query);
		const video = this.pickVideoInfo(info);
		const webpageUrl = video.webpage_url || video.original_url || video.url || (isUrl ? query : null);
		if (!webpageUrl) throw new Error('No results');

		const fullInfo = isUrl ? video : await extractYT(webpageUrl);
		const audioUrl = this.pickAudioUrl(fullInfo);
		if (!audioUrl) throw new Error('No audio stream found');

		return {
			title: fullInfo.title || video.title || 'Faixa sem título',
			url: webpageUrl,
			audioUrl,
			requester,
		};
	}

	isUrl(query) {
		try {
			new URL(query);
			return true;
		} catch {
			return false;
		}
	}

	pickVideoInfo(info) {
		if (info?.entries?.length) return info.entries[0];
		return info;
	}

	pickAudioUrl(info) {
		const formats = Array.isArray(info?.formats) ? info.formats : [];
		const candidates = formats.filter((format) => format?.url && format.acodec && format.acodec !== 'none');

		if (!candidates.length) return info?.url || info?.webpage_url || null;

		const ranked = [...candidates].sort((left, right) => this.rankFormat(right) - this.rankFormat(left));
		return ranked[0]?.url || info?.url || info?.webpage_url || null;
	}

	rankFormat(format) {
		let score = 0;
		if (format.acodec === 'opus') score += 1000;
		if (format.ext === 'webm') score += 100;
		if (format.ext === 'm4a') score += 50;
		if (typeof format.abr === 'number') score += format.abr;
		if (typeof format.tbr === 'number') score += format.tbr / 10;
		return score;
	}

	async playNext(voiceChannel) {
		if (this.queue.isEmpty()) {
			this.current = null;
			return null;
		}
		const track = this.queue.shift();
		this.current = track;
		if (!this.connection && voiceChannel) await this.join(voiceChannel);

		const response = await fetch(track.audioUrl);
		if (!response.ok || !response.body) {
			throw new Error(`Falha ao obter stream de áudio: ${response.status}`);
		}

		const nodeStream = Readable.fromWeb(response.body);
		const probe = await demuxProbe(nodeStream);
		const resource = createAudioResource(probe.stream, { inputType: probe.type });
		this.player.play(resource);
		return track;
	}

	pause() {
		this.player.pause();
	}

	resume() {
		this.player.unpause();
	}

	stop() {
		this.queue.clear();
		this.player.stop();
		if (this.connection) {
			try { this.connection.destroy(); } catch (e) {}
			this.connection = null;
		}
		this.current = null;
	}

	skip() {
		this.player.stop();
	}
}
