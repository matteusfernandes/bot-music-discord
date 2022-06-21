module.exports = {
  name: 'playskip',
  aliases: ['ps'],
  inVoiceChannel: true,
  run: async (client, message, args) => {
    const string = args.join(' ');
    if (!string) return message.channel.send(`${client.emotes.error} | Coloque a URL da música ou trecho para pesquisar.`);
    client.distube.play(message.member.voice.channel, string, {
      member: message.member,
      textChannel: message.channel,
      message,
      skip: true
    });
  },
};
