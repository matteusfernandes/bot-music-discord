const config = require('../config.json');

module.exports = {
  name: 'skip',
  inVoiceChannel: true,
  run: async (client, message) => {
    const queue = client.distube.getQueue(message);
    if (!queue) message.channel.send(`${client.emotes.error} | A fila está vazia!`);
    try {
      const song = await queue.skip();
      message.channel.send(`${client.emotes.success} | Skipped! Tocando agora:\n${song.name}`);
    } catch (e) {
      client.channels.fetch(config.idLogErrorChannel)
      .then((chn) => chn.send(`${client.emotes.error} | ${e}`));
      message.channel.send('Não existe música para pular!');
    }
  }
};
