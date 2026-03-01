import { describe, it, expect, vi } from "vitest";
import DynamicStorageTiering from '../src/dynamic_storage_tiering.js';

describe('DynamicStorageTiering', () => {
  let tiering;

  beforeEach(() => {
    tiering = new DynamicStorageTiering();
  });

  it('records access and increments count', () => {
    tiering.recordAccess('/test/file');
    tiering.recordAccess('/test/file');
    expect(tiering.accessPatterns.get('/test/file')).toBe(2);
  });

  it('identifies cold files correctly', () => {
    tiering.recordAccess('/test/file');
    expect(tiering.isCold('/test/file')).toBe(true);
    tiering.recordAccess('/test/file');
    tiering.recordAccess('/test/file');
    tiering.recordAccess('/test/file');
    tiering.recordAccess('/test/file');
    expect(tiering.isCold('/test/file')).toBe(true);
    tiering.recordAccess('/test/file');
    expect(tiering.isCold('/test/file')).toBe(false);
  });

  it('migrates files successfully', () => {
    expect(tiering.migrate('/test/file')).toBe(true);
  });
});
