import { getManager } from "../../music/manager.js";

export function comandoParar(interaction) {
	if (!interaction.isCommand()) return;

	const manager = getManager(interaction.guildId);
	if (!manager) return interaction.reply({ content: 'Nenhuma reprodução ativa.', ephemeral: true });

	manager.stop();
	return interaction.reply({ content: 'Reprodução encerrada e fila limpa.' });
}
