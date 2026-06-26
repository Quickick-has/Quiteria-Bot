import { getManager } from "../../music/manager.js";

export function comandoPausar(interaction) {
	if (!interaction.isCommand()) return;

	const manager = getManager(interaction.guildId);
	if (!manager) return interaction.reply({ content: 'Nenhuma reprodução ativa.', ephemeral: true });

	manager.pause();
	return interaction.reply({ content: 'Música pausada.' });
}
