module.exports = {
  name: 'seek',
  inVoiceChannel: true,
  run: async (client, message, args) => {
    const queue = client.distube.getQueue(message);
    if (!queue) message.channel.send(`${client.emotes.error} | A fila está vazia!`);
    if (!args[0]) {
      return message.channel.send(`${client.emotes.error} | Informe a posição da música (em segundos) para adiantar!`);
    }
    const time = Number(args[0]);
    if (isNaN(time)) return message.channel.send(`${client.emotes.error} | Por favor informe um número válido!`);
    queue.seek(time);
    message.channel.send(`Adiantado para ${time}!`);
  },
};
