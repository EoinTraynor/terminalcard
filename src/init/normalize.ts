export interface NormalizedSocialLink {
  platform: string;
  label: string;
  displayHandle: string;
  url: string;
}

/**
 * Normalizes user input for social platforms, accepting:
 * - Plain handles: "eointraynor"
 * - Handles with @: "@eointraynor"
 * - Full URLs: "https://github.com/eointraynor"
 *
 * Returns clean display handles and canonical clickable URLs.
 */
export function normalizeSocialLink(platform: string, rawInput?: string | null): NormalizedSocialLink | null {
  if (!rawInput || !rawInput.trim()) return null;
  const input = rawInput.trim();

  switch (platform.toLowerCase()) {
    case 'github': {
      const handle = input
        .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
        .replace(/^@/, '')
        .replace(/\/.*$/, '')
        .trim();
      if (!handle) return null;
      return {
        platform: 'github',
        label: 'GitHub',
        displayHandle: `@${handle}`,
        url: `https://github.com/${handle}`,
      };
    }

    case 'linkedin': {
      const handle = input
        .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '')
        .replace(/^linkedin\.com\/in\//i, '')
        .replace(/^in\//i, '')
        .replace(/^@/, '')
        .replace(/\/.*$/, '')
        .trim();
      if (!handle) return null;
      return {
        platform: 'linkedin',
        label: 'LinkedIn',
        displayHandle: handle,
        url: `https://www.linkedin.com/in/${handle}/`,
      };
    }

    case 'twitter':
    case 'x': {
      const handle = input
        .replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//i, '')
        .replace(/^(twitter|x)\.com\//i, '')
        .replace(/^@/, '')
        .replace(/\/.*$/, '')
        .trim();
      if (!handle) return null;
      return {
        platform: 'twitter',
        label: 'Twitter/X',
        displayHandle: `@${handle}`,
        url: `https://x.com/${handle}`,
      };
    }

    case 'bluesky':
    case 'bsky': {
      let handle = input
        .replace(/^https?:\/\/(www\.)?bsky\.app\/profile\//i, '')
        .replace(/^@/, '')
        .replace(/\/.*$/, '')
        .trim();
      if (!handle) return null;
      if (!handle.includes('.')) {
        handle = `${handle}.bsky.social`;
      }
      return {
        platform: 'bluesky',
        label: 'Bluesky',
        displayHandle: `@${handle}`,
        url: `https://bsky.app/profile/${handle}`,
      };
    }

    case 'mastodon': {
      // Format 1: https://instance.social/@user
      const urlMatch = input.match(/^https?:\/\/([^/]+)\/@([^/]+)/i);
      if (urlMatch) {
        const instance = urlMatch[1];
        const user = urlMatch[2];
        return {
          platform: 'mastodon',
          label: 'Mastodon',
          displayHandle: `@${user}@${instance}`,
          url: `https://${instance}/@${user}`,
        };
      }

      // Format 2: @user@instance.social or user@instance.social
      const handleParts = input.replace(/^@/, '').split('@');
      if (handleParts.length === 2 && handleParts[0] && handleParts[1]) {
        const user = handleParts[0];
        const instance = handleParts[1];
        return {
          platform: 'mastodon',
          label: 'Mastodon',
          displayHandle: `@${user}@${instance}`,
          url: `https://${instance}/@${user}`,
        };
      }

      // Fallback
      const url = input.startsWith('http') ? input : `https://${input}`;
      return {
        platform: 'mastodon',
        label: 'Mastodon',
        displayHandle: input,
        url,
      };
    }

    case 'website':
    case 'portfolio':
    default: {
      const url = input.startsWith('http://') || input.startsWith('https://') ? input : `https://${input}`;
      const displayHandle = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
      return {
        platform: platform.toLowerCase(),
        label: platform.charAt(0).toUpperCase() + platform.slice(1),
        displayHandle,
        url,
      };
    }
  }
}
