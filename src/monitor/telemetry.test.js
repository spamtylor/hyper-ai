import { describe, it, expect } from 'vitest';
import telemetry from './telemetry';

describe('telemetry', () => {
  it('should return telemetry data', () => {
    expect(telemetry).toHaveProperty('cpuLoad');
  });
});
