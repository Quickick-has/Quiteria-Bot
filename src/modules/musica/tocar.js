import { getManager } from "../../music/manager.js";
import { spawn } from "child_process";

export async function comandoTocar(interaction) {
	if (!interaction.isCommand()) return;

	const query = interaction.options.getString('query') || interaction.options.getString('url') || interaction.options.getString('musica');
	const voiceChannel = interaction.member?.voice?.channel;
	if (!voiceChannel) return interaction.reply({ content: 'Você precisa entrar em um canal de voz primeiro.', ephemeral: true });

	if (!query) return interaction.reply({ content: 'Forneça um link ou termo para buscar.', ephemeral: true });

	try {
		await interaction.deferReply();
		const manager = getManager(interaction.guildId);
		const track = await manager.enqueue(query, voiceChannel, interaction.user.username);
		return interaction.editReply({ content: `Adicionado à fila: **${track.title}**` });
	} catch (error) {
		console.error('Erro ao tocar:', error);
		if (interaction.deferred || interaction.replied) {
			return interaction.editReply({ content: 'Não foi possível reproduzir a música.' });
		}
		return interaction.reply({ content: 'Não foi possível reproduzir a música.', ephemeral: true });
	}
}

export function searchYT(query) {
	return new Promise((resolve, reject) => {
		const yt = spawn("yt-dlp", [
			"--dump-json",
			`ytsearch1:${query}`
		]);

		let output = "";

		yt.stdout.on("data", (data) => {
			output += data.toString();
		});

		yt.on("close", () => {
			try {
				resolve(JSON.parse(output));
			} catch (err) {
				reject(err);
			}
		});

		yt.on("error", reject);
	});
}

