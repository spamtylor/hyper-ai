import { test, expect } from 'vitest';
import DiscordIntegration from './discord';

test('DiscordIntegration instantiates', () => {
  const token = 'mock_token';
  const bot = new DiscordIntegration(token);
  expect(bot).toBeInstanceOf(DiscordIntegration);
});
