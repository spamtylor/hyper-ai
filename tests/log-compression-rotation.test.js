import { describe, it, expect, vi } from "vitest";
import { compressOldLogs } from '../src/log-compression-rotation';

const mockExec = vi.fn();
const mockFs = {
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn(),
  statSync: vi.fn(),
  unlinkSync: vi.fn()
};

beforeAll(() => {
  vi.spyOn(require('child_process'), 'exec').mockImplementation((cmd, callback) => {
    mockExec(cmd);
    callback(null, { stdout: 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        100G   80G   20G  80% /' });
  });
  vi.spyOn(fs, 'existsSync').mockImplementation(mockFs.existsSync);
  vi.spyOn(fs, 'mkdirSync').mockImplementation(mockFs.mkdirSync);
  vi.spyOn(fs, 'readdirSync').mockImplementation(mockFs.readdirSync);
  vi.spyOn(fs, 'statSync').mockImplementation(mockFs.statSync);
  vi.spyOn(fs, 'unlinkSync').mockImplementation(mockFs.unlinkSync);
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('compressOldLogs', () => {
  it('skips when disk usage > 80%', async () => {
    vi.spyOn(require('child_process'), 'exec').mockImplementation((cmd, callback) => {
      if (cmd.includes('df')) {
        callback(null, { stdout: 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        100G   85G   15G  85% /' });
      }
    });
    await compressOldLogs();
    expect(mockExec).toHaveBeenCalledWith('df -h /');
    expect(mockExec).not.toHaveBeenCalledWith(expect.stringContaining('gzip'));
  });

  it('compresses old files when disk usage <= 80%', async () => {
    vi.spyOn(require('child_process'), 'exec').mockImplementation((cmd, callback) => {
      if (cmd.includes('df')) {
        callback(null, { stdout: 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        100G   75G   25G  75% /' });
      }
    });
    mockFs.existsSync.mockReturnValue(false);
    mockFs.readdirSync.mockReturnValue(['old.log']);
    mockFs.statSync.mockReturnValue({ isFile: () => true, mtimeMs: Date.now() - 31 * 24 * 60 * 60 * 1000 });
    await compressOldLogs();
    expect(mockExec).toHaveBeenCalledWith('df -h /');
    expect(mockExec).toHaveBeenCalledWith(expect.stringContaining('gzip'));
  });
});
