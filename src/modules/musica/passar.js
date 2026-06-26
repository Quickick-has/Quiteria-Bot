import { getManager } from "../../music/manager.js";

export function comandoPassar(interaction) {
	if (!interaction.isCommand()) return;

	const manager = getManager(interaction.guildId);
	if (!manager) return interaction.reply({ content: 'Nenhuma reprodução ativa.', ephemeral: true });

	manager.skip();
	return interaction.reply({ content: 'Música pulada.' });
}
