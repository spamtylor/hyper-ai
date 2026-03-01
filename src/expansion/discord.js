const { Client, GatewayIntentBits } = require('discord.js');
const memory = require('../memory/memory.js');

class DiscordIntegration {
  constructor(token) {
    this.client = new Client({ intents: [GatewayIntentBits.GuildMessages] });
    this.token = token;

    this.client.on('messageCreate', (message) => {
      if (message.author.bot || message.system) return;
      memory.addMessage(message.content);
    });
  }

  start() {
    this.client.login(this.token);
  }
}

module.exports = DiscordIntegration;
