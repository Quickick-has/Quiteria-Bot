import { client } from "../client.js";
import { handleButtons } from "../handlers/buttonHandler.js";
import { comandoCalculadora } from "../modules/calculadora/calculadora.js";
import { comandoDog } from "../modules/dog/dog.js";
import { comandoAdivinhar } from "../modules/adivinhar/adivinhar.js";
import { comandoLaura } from "../modules/laura/laura-command.js";
import { comandoSlack } from "../modules/slack/slack.js";
import { comandoTocar } from "../modules/musica/tocar.js";
import { comandoPausar } from "../modules/musica/pausar.js";
import { comandoPassar } from "../modules/musica/passar.js";
import { comandoParar } from "../modules/musica/parar.js";

client.on("interactionCreate", async (interaction) => {
  try {
  // primeiro tenta botões
  if (await handleButtons(interaction)) return;

  // slash commands
  if (!interaction.isChatInputCommand()) return;


  const comands ={
    somar:comandoCalculadora,
    multiplicar:comandoCalculadora,
    slack:comandoSlack,
    dog:comandoDog,
    adivinhar:comandoAdivinhar,
    laura:comandoLaura,
    tocar:comandoTocar,
    pausar:comandoPausar,
    passar:comandoPassar,
    parar:comandoParar,
  }

  const command = comands[interaction.commandName];

  if (!command) return;

  await command(interaction, interaction.commandName);
  } catch (error) {
    console.error(`Erro ao processar interação: ${error.message}`);
    const payload = { content: "Ocorreu um erro ao processar a interação. Por favor, tente novamente mais tarde.", ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(payload).catch(() => null);
    } else if (interaction.isRepliable()) {
      await interaction.reply(payload).catch(() => null);
    }
  }
  // switch (interaction.commandName) {
  //   case "somar": {
  //     comandoCalculadora(interaction, "somar");
  //     break;
  //   }
  //   case "multiplicar": {
  //     comandoCalculadora(interaction, "multiplicar");
  //     break;
  //   }
  //   case "slack": {
  //     comandoSlack(interaction);
  //     break;
  //   }
  //   case "dog": {
  //     comandoDog(interaction);
  //     break;
  //   }
  //   case "adivinhar": {
  //     comandoAdivinhar(interaction);
  //     break;
  //   }
  //   case "laura": {
  //     comandoLaura(interaction);
  //     break;
  //   }
  // }
})
