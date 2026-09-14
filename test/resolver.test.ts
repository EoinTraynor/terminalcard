import { describe, it, expect } from 'vitest';
import { resolveCard, detectLocalUser } from '../src/runner/resolver.js';
import { writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

describe('resolveCard', () => {
  it('resolves from a local JSON file path', async () => {
    const tmpFile = resolve(process.cwd(), 'test-sample-card.json');
    writeFileSync(
      tmpFile,
      JSON.stringify({
        name: 'Test Engineer',
        handle: 'testengineer',
        jobTitle: 'Site Reliability Engineer',
        links: {
          github: 'https://github.com/testengineer',
        },
      }),
      'utf8',
    );

    try {
      const res = await resolveCard(tmpFile);
      expect(res.config.name).toBe('Test Engineer');
      expect(res.config.handle).toBe('testengineer');
      expect(res.source).toContain('local file');
    } finally {
      unlinkSync(tmpFile);
    }
  });

  it('resolves from local cards registry directory', async () => {
    const tmpRegistry = resolve(process.cwd(), 'test-cards');
    const { mkdirSync, rmSync } = await import('node:fs');
    mkdirSync(tmpRegistry, { recursive: true });
    writeFileSync(
      resolve(tmpRegistry, 'johndoe.json'),
      JSON.stringify({
        name: 'John Doe',
        handle: 'johndoe',
        links: {
          github: 'https://github.com/johndoe',
        },
      }),
      'utf8',
    );

    try {
      const res = await resolveCard('johndoe', { localRegistryDir: tmpRegistry });
      expect(res.config.name).toBe('John Doe');
      expect(res.source).toContain('community registry');
    } finally {
      rmSync(tmpRegistry, { recursive: true, force: true });
    }
  });

  it('detects local user handle without throwing', () => {
    const user = detectLocalUser();
    expect(typeof user === 'string' || user === null).toBe(true);
  });
});
