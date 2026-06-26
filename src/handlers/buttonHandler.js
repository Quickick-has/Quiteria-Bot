import { handleLauraButton } from "../modules/laura/laura-command.js";

export async function handleButtons(interaction) {
  return await handleLauraButton(interaction);
}