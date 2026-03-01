#!/bin/bash
cat << 'EOF' > $HYPER_ROOT/src/expansion/discord.js
const { Client, GatewayIntentBits } = require('discord.js');
const memory = require('../../memory.js');

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
EOF
cat << 'EOF' > $HYPER_ROOT/src/expansion/discord.test.js
import { test, expect } from 'vitest';
import DiscordIntegration from './discord';

test('DiscordIntegration instantiates', () => {
  const token = 'mock_token';
  const bot = new DiscordIntegration(token);
  expect(bot).toBeInstanceOf(DiscordIntegration);
});
EOF
