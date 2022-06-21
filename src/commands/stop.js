module.exports = {
  name: 'stop',
  aliases: ['disconnect', 'leave'],
  inVoiceChannel: true,
  run: async (client, message) => {
    const queue = client.distube.getQueue(message)
    if (!queue) message.channel.send(`${client.emotes.error} | A fila está vazia!`)
    queue.stop()
    message.channel.send(`${client.emotes.success} | Stopped!`)
  },
};
