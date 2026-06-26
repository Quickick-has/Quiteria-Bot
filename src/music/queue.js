export default class MusicQueue {
	constructor() {
		this.songs = [];
	}

	push(song) {
		this.songs.push(song);
	}

	shift() {
		return this.songs.shift();
	}

	peek() {
		return this.songs[0];
	}

	isEmpty() {
		return this.songs.length === 0;
	}

	clear() {
		this.songs = [];
	}
}
