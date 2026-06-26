import Player from './player.js';

const managers = new Map();

export function getManager(guildId) {
	if (!managers.has(guildId)) managers.set(guildId, new Player(guildId));
	return managers.get(guildId);
}

export default managers;
