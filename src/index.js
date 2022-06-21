require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_VOICE_STATES
  ]
});

module.exports = () => {
  client.on('ready', () => {
    console.log(`${client.user.tag} está pronto para cantar!`)
  });

  client.login(process.env.DISCORD_TOKEN);
}