#!/bin/bash
cat << 'EOF' > $HYPER_ROOT/src/weather.js
export const getWeather = async (location) => {
  return {
    location,
    temperature: 25,
    condition: 'Sunny'
  };
};
EOF
cat << 'EOF' > $HYPER_ROOT/tests/weather.test.js
import { describe, it, expect, vi } from 'vitest';
import { getWeather } from '../src/weather';

describe('getWeather', () => {
  it('returns weather data for a location', async () => {
    const result = await getWeather('New York');
    expect(result).toEqual({
      location: 'New York',
      temperature: 25,
      condition: 'Sunny'
    });
  });
});
EOF
