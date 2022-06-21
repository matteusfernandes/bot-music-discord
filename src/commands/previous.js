module.exports = {
  name: 'previous',
  inVoiceChannel: true,
  run: async (client, message) => {
    const queue = client.distube.getQueue(message);
    if (!queue) message.channel.send(`${client.emotes.error} | A fila está vazia!`);
    const song = queue.previous();
    message.channel.send(`${client.emotes.success} | Tocando agora:\n${song.name}`);
  }
};
