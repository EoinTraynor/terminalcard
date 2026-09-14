import { describe, it, expect } from 'vitest';
import { normalizeSocialLink } from '../src/init/normalize.js';

describe('normalizeSocialLink', () => {
  describe('GitHub normalization', () => {
    it('normalizes plain handle', () => {
      const res = normalizeSocialLink('github', 'eointraynor');
      expect(res).toEqual({
        platform: 'github',
        label: 'GitHub',
        displayHandle: '@eointraynor',
        url: 'https://github.com/eointraynor',
      });
    });

    it('normalizes handle with leading @', () => {
      const res = normalizeSocialLink('github', '@EoinTraynor');
      expect(res?.displayHandle).toBe('@EoinTraynor');
      expect(res?.url).toBe('https://github.com/EoinTraynor');
    });

    it('normalizes full GitHub URL', () => {
      const res = normalizeSocialLink('github', 'https://github.com/EoinTraynor/');
      expect(res?.displayHandle).toBe('@EoinTraynor');
      expect(res?.url).toBe('https://github.com/EoinTraynor');
    });
  });

  describe('LinkedIn normalization', () => {
    it('normalizes plain handle', () => {
      const res = normalizeSocialLink('linkedin', 'eointraynor');
      expect(res).toEqual({
        platform: 'linkedin',
        label: 'LinkedIn',
        displayHandle: 'eointraynor',
        url: 'https://www.linkedin.com/in/eointraynor/',
      });
    });

    it('normalizes in/handle format', () => {
      const res = normalizeSocialLink('linkedin', 'in/eointraynor');
      expect(res?.displayHandle).toBe('eointraynor');
      expect(res?.url).toBe('https://www.linkedin.com/in/eointraynor/');
    });

    it('normalizes full LinkedIn URL', () => {
      const res = normalizeSocialLink('linkedin', 'https://www.linkedin.com/in/eointraynor/');
      expect(res?.displayHandle).toBe('eointraynor');
      expect(res?.url).toBe('https://www.linkedin.com/in/eointraynor/');
    });
  });

  describe('Twitter / X normalization', () => {
    it('normalizes Twitter handle', () => {
      const res = normalizeSocialLink('twitter', '@EoinTraynor1');
      expect(res?.displayHandle).toBe('@EoinTraynor1');
      expect(res?.url).toBe('https://x.com/EoinTraynor1');
    });

    it('normalizes x.com URL', () => {
      const res = normalizeSocialLink('x', 'https://x.com/EoinTraynor1');
      expect(res?.displayHandle).toBe('@EoinTraynor1');
      expect(res?.url).toBe('https://x.com/EoinTraynor1');
    });
  });

  describe('Bluesky normalization', () => {
    it('appends .bsky.social for standard handles', () => {
      const res = normalizeSocialLink('bluesky', 'eointraynor');
      expect(res?.displayHandle).toBe('@eointraynor.bsky.social');
      expect(res?.url).toBe('https://bsky.app/profile/eointraynor.bsky.social');
    });

    it('preserves custom domain handles like eoin.dev', () => {
      const res = normalizeSocialLink('bluesky', '@eoin.dev');
      expect(res?.displayHandle).toBe('@eoin.dev');
      expect(res?.url).toBe('https://bsky.app/profile/eoin.dev');
    });
  });

  describe('Mastodon normalization', () => {
    it('normalizes Webfinger @user@instance format', () => {
      const res = normalizeSocialLink('mastodon', '@alice@fosstodon.org');
      expect(res?.displayHandle).toBe('@alice@fosstodon.org');
      expect(res?.url).toBe('https://fosstodon.org/@alice');
    });

    it('normalizes instance URL format', () => {
      const res = normalizeSocialLink('mastodon', 'https://mastodon.social/@bob');
      expect(res?.displayHandle).toBe('@bob@mastodon.social');
      expect(res?.url).toBe('https://mastodon.social/@bob');
    });
  });

  describe('Website normalization', () => {
    it('prepends https:// when missing', () => {
      const res = normalizeSocialLink('website', 'eointraynor.com');
      expect(res?.displayHandle).toBe('eointraynor.com');
      expect(res?.url).toBe('https://eointraynor.com');
    });

    it('handles full https:// URL', () => {
      const res = normalizeSocialLink('website', 'https://www.eointraynor.com/');
      expect(res?.displayHandle).toBe('eointraynor.com');
      expect(res?.url).toBe('https://www.eointraynor.com/');
    });
  });

  describe('Empty and null handling', () => {
    it('returns null for empty string or whitespace', () => {
      expect(normalizeSocialLink('github', '')).toBeNull();
      expect(normalizeSocialLink('github', '   ')).toBeNull();
      expect(normalizeSocialLink('github', null)).toBeNull();
    });
  });
});
