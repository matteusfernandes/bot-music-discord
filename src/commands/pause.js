module.exports = {
  name: 'pause',
  aliases: ['pause', 'hold'],
  inVoiceChannel: true,
  run: async (client, message) => {
    const queue = client.distube.getQueue(message);
    if (!queue) return message.channel.send(`${client.emotes.error} | A fila está vazia!`);
    if (queue.pause) {
      queue.resume();
      return message.channel.send('Continuando a música :)');
    }
    queue.pause();
    message.channel.send('Pausando a música :)');
  },
};
