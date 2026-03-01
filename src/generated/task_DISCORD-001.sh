#!/bin/bash
cat << 'EOF' > ~/Projects/hyper/src/expansion/discord.js
const { Client, GatewayIntentBits } = require('discord.js');
const memory = require('../memory');

class DiscordBot {
  constructor(token) {
    this.client = new Client({ intents: [GatewayIntentBits.GuildMessages] });
    this.token = token;
  }

  start() {
    this.client.on('messageCreate', async (message) => {
      if (message.author.bot || message.system) return;
      const messageData = {
        id: message.id,
        content: message.content,
        author: message.author.tag,
        channel: message.channel.name,
        timestamp: message.createdAt
      };
      await memory.addMessage(messageData);
    });
    this.client.login(this.token);
  }
}

module.exports = DiscordBot;
EOF
cat << 'EOF' > ~/Projects/hyper/tests/expansion/discord.test.js
import { describe, it, expect, vi } from 'vitest';
import DiscordBot from '../src/expansion/discord';

vi.mock('discord.js', () => ({
  Client: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    login: vi.fn()
  })),
  GatewayIntentBits: {
    GuildMessages: 'GuildMessages'
  }
}));

vi.mock('../memory', () => ({
  addMessage: vi.fn()
}));

describe('DiscordBot', () => {
  it('instantiates without error', () => {
    const token = 'test-token';
    const bot = new DiscordBot(token);
    expect(bot).toBeInstanceOf(DiscordBot);
  });
});
EOF
