import{ Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { commands } from "./src/comandos.js";
import dotenv from "dotenv";
import "./src/index.js";


dotenv.config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const rest = new REST({ version: "10" }).setToken(TOKEN);

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.login(TOKEN);

client.once("ready", async () => {
  console.log(`Bot está online como ${client.user.tag}!`);

  try {
    console.log("Registrando comandos globais...");
    console.log(`🔧 CLIENT_ID: ${CLIENT_ID}`);

    const resultado = await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: commands,
    });

    console.log(`Comandos registrados com sucesso!`);
  } catch (error) {
    console.error("Erro ao registrar comandos:", error.message);
  }
});