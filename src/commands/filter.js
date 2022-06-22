module.exports = {
  name: 'filter',
  aliases: ['filters'],
  inVoiceChannel: true,
  run: async (client, message, args) => {
    const queue = client.distube.getQueue(message);
    if (!queue) return message.channel.send(`${client.emotes.error} | A fila está vazia!`);
    if (args[0] === 'off' && queue.filters?.length) queue.setFilter(false);
    else if (Object.keys(client.distube.filters).includes(args[0])) queue.setFilter(args[0]);
    else if (args[0]) return message.channel.send(`${client.emotes.error} | Filtro inválido!`);
    message.channel.send(`Filtro Atual: \`${queue.filters.join(', ') || 'Off'}\``);
  },
};
