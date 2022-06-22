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
  let logChannel;

  client.on('ready', async () => {
    console.log(`${client.user.tag} está pronto para cantar!`);

    logChannel = await client.channels.fetch(config.idLogErrorChannel);
    logChannel.send(`${client.user.tag} está pronto para cantar!`);
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
    if (err) logChannel.send('Could not find any commands!');

    const jsFiles = files.filter(f => f.split('.').pop() === 'js');
    if (jsFiles.length <= 0) logChannel.send('Could not find any commands!');
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

    const correctChannel = config.idMusicChannel;
    if (message.channelId !== correctChannel) {
      message.delete(message.id);
      message.channel.send(`${client.emotes.error} | Canal errado! Tente em <#${correctChannel}>!`);
      return;
    }

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
      logChannel.send(`${client.emotes.error} | Error: \`${e}\``);
      message.channel.send(`${client.emotes.error} | Error: \`${e}\``);
    }
  });

  const status = queue =>
  `Volume: \`${queue.volume}%\` | Filtro: \`${queue.filters.join(', ') || 'Off'}\` | Repetir: \`${
    queue.repeatMode ? (queue.repeatMode === 2 ? 'All Queue' : 'This Song') : 'Off'
  }\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``;

client.distube
  .on('playSong', (queue, song) =>
    queue.textChannel.send(
      `${client.emotes.play} | Tocando \`${song.name}\` - \`${song.formattedDuration}\`\nAdicionada por: ${
        song.user
      }\n${status(queue)}`
    ),
  )
  .on('addSong', (queue, song) =>
    queue.textChannel.send(
      `${client.emotes.success} | Adicionada ${song.name} - \`${song.formattedDuration}\` na fila por ${song.user}`
    )
  )
  .on('addList', (queue, playlist) =>
    queue.textChannel.send(
      `${client.emotes.success} | Adicionada \`${playlist.name}\` playlist (${
        playlist.songs.length
      } músicas) na fila\n${status(queue)}`
    )
  )
  .on('error', (channel, e) => {
    channel.send(`${client.emotes.error} | Ocorreu um erro: ${e.toString().slice(0, 1974)}`);
    logChannel.send(`${client.emotes.error} | Error: \`${e.message}\``);
  })
  .on('empty', channel => channel.send('Canal de voz vazio! Saindo do canal...'))
  .on('searchNoResult', (message, query) =>
    message.channel.send(`${client.emotes.error} | Nenhum resultado encontrado \`${query}\`!`)
  )
  .on('finish', queue => queue.textChannel.send('Finalizando!'));

  client.login(process.env.DISCORD_TOKEN);
}
