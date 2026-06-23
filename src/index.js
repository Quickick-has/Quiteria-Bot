import { client } from "./client.js";

import { comandoCalculadora } from "./modules/calculadora/calculadora.js";
import { comandoDog } from "./modules/dog/dog.js";
import { comandoAdivinhar } from "./modules/adivinhar/adivinhar.js";
import { comandoLaura, handleLauraButton } from "./modules/laura/laura-command.js";
import { comandoSlack } from "./modules/slack/slack.js";

client.on("interactionCreate", async (interaction) => {
  const handledButton = await handleLauraButton(interaction);
  if (handledButton) return;
  
  if (!interaction.isCommand()) {
    return;
  }

  switch (interaction.commandName) {
    case "somar": {
      comandoCalculadora(interaction, "somar");
      break;
    }
    case "multiplicar": {
      comandoCalculadora(interaction, "multiplicar");
      break;
    }
    case "slack": {
      comandoSlack(interaction);
      break;
    }
    case "dog": {
      comandoDog(interaction);
      break;
    }
    case "adivinhar": {
      comandoAdivinhar(interaction);
      break;
    }
    case "laura": {
      comandoLaura(interaction);
      break;
    }
  }
})
