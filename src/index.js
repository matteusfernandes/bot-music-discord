require('dotenv').config();

const { DisTube } = require('distube');
const Discord = require('discord.js');
const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_VOICE_STATES
  ]
});
const fs = require('fs');
const config = require('./config.json');
const { SpotifyPlugin } = require('@distube/spotify');
const { YtDlpPlugin } = require('@distube/yt-dlp');

module.exports = () => {
  client.on('ready', () => {
    console.log(`${client.user.tag} está pronto para cantar!`)
  });

  client.config = require('./config.json');

  client.distube = new DisTube(client, {
    leaveOnStop: false,
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: false,
    plugins: [
      new SpotifyPlugin({
        emitEventsAfterFetching: true
      }),
      new YtDlpPlugin(),
    ],
    youtubeDL: false
  });

  client.commands = new Discord.Collection();
  client.aliases = new Discord.Collection();
  client.emotes = config.emoji;

  fs.readdir('./src/commands/', (err, files) => {
    if (err) console.log('Could not find any commands!');

    const jsFiles = files.filter(f => f.split('.').pop() === 'js');
    if (jsFiles.length <= 0) console.log('Could not find any commands!');
    jsFiles.forEach(file => {
      const cmd = require(`./commands/${file}`);
      console.log(`Loaded ${file}`);
      client.commands.set(cmd.name, cmd);
      if (cmd.aliases) cmd.aliases.forEach(alias => client.aliases.set(alias, cmd.name));
    });
  });

  client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    const prefix = config.prefix;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
    if (!cmd) return;
    if (cmd.inVoiceChannel && !message.member.voice.channel) {
      return message.channel.send(`${client.emotes.error} | Você deve estar conectado em um canal de voz!`);
    }
    try {
      cmd.run(client, message, args);
    } catch (e) {
      console.error(e);
      message.channel.send(`${client.emotes.error} | Error: \`${e}\``);
    }
  });

  client.login(process.env.DISCORD_TOKEN);
}
