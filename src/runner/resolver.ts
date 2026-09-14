import { existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import type { TerminalCardConfig } from '../types.js';

export interface ResolveOptions {
  timeoutMs?: number;
  localRegistryDir?: string;
}

/**
 * Detects the current user's GitHub or git handle from local git config or environment.
 */
export function detectLocalUser(): string | null {
  try {
    const ghUser = execSync('git config --get github.user', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    if (ghUser) return ghUser;
  } catch {}

  try {
    const gitUser = execSync('git config --get user.name', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    if (gitUser) return gitUser;
  } catch {}

  if (process.env.GITHUB_USER) return process.env.GITHUB_USER;
  if (process.env.USER) return process.env.USER;

  return null;
}

/**
 * Resolves a TerminalCardConfig using the 3-tier waterfall:
 * 1. Local file (if valid path or .terminalcard.json exists in CWD)
 * 2. User's GitHub profile repository (github.com/user/user/.terminalcard.json)
 * 3. Local / Remote PR Registry (cards/user.json)
 * 4. Fallback to public GitHub API (api.github.com/users/user)
 */
export async function resolveCard(
  usernameOrPath: string,
  options: ResolveOptions = {},
): Promise<{ config: TerminalCardConfig; source: string }> {
  const timeoutMs = options.timeoutMs ?? 5000;

  // 1. Check if argument points to a direct local file
  const directPath = resolve(process.cwd(), usernameOrPath);
  if (existsSync(directPath)) {
    try {
      const content = readFileSync(directPath, 'utf8');
      const parsed = JSON.parse(content) as TerminalCardConfig;
      if (parsed && parsed.name && parsed.handle) {
        return { config: parsed, source: `local file: ${usernameOrPath}` };
      }
    } catch {}
  }

  const username = usernameOrPath.replace(/^@/, '').trim();

  // 2. Check CWD for .terminalcard.json or card.json
  const cwdConfig = resolve(process.cwd(), '.terminalcard.json');
  if (existsSync(cwdConfig)) {
    try {
      const content = readFileSync(cwdConfig, 'utf8');
      const parsed = JSON.parse(content) as TerminalCardConfig;
      if (parsed.handle?.toLowerCase() === username.toLowerCase()) {
        return { config: parsed, source: 'current directory: .terminalcard.json' };
      }
    } catch {}
  }

  // 3. Check bundled local cards/ directory (Tier 2 local)
  const registryDir = options.localRegistryDir ?? fileURLToPath(new URL('../cards', import.meta.url));
  const localRegistryPath = join(registryDir, `${username.toLowerCase()}.json`);
  if (existsSync(localRegistryPath)) {
    try {
      const content = readFileSync(localRegistryPath, 'utf8');
      const parsed = JSON.parse(content) as TerminalCardConfig;
      return { config: parsed, source: `community registry: ${username.toLowerCase()}.json` };
    } catch {}
  }

  // 4. Tier 1: Fetch from GitHub profile repo (.terminalcard.json)
  const profileBranches = ['main', 'master'];
  const filenames = ['.terminalcard.json', 'terminalcard.json', 'card.json'];

  for (const branch of profileBranches) {
    for (const file of filenames) {
      const url = `https://raw.githubusercontent.com/${username}/${username}/${branch}/${file}`;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);

        if (res.ok) {
          const parsed = (await res.json()) as TerminalCardConfig;
          if (parsed && parsed.name && parsed.handle) {
            return { config: parsed, source: `github profile repository: ${username}/${username}/${file}` };
          }
        }
      } catch {}
    }
  }

  // 5. Tier 2 (remote): Fetch from terminalcard central GitHub registry
  const remoteRegistryUrl = `https://raw.githubusercontent.com/EoinTraynor/terminalcard/main/cards/${username.toLowerCase()}.json`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(remoteRegistryUrl, { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const parsed = (await res.json()) as TerminalCardConfig;
      if (parsed && parsed.name && parsed.handle) {
        return { config: parsed, source: `remote registry: cards/${username.toLowerCase()}.json` };
      }
    }
  } catch {}

  // 6. Tier 3 Fallback: GitHub Public API
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'User-Agent': 'terminalcard-cli',
        Accept: 'application/vnd.github.v3+json',
      },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const gh = (await res.json()) as any;
      const config: TerminalCardConfig = {
        name: gh.name || gh.login,
        handle: gh.login,
        jobTitle: gh.bio ? undefined : 'Developer',
        company: gh.company ? gh.company.replace(/^@/, '') : undefined,
        tagline: gh.bio || `GitHub developer with ${gh.public_repos ?? 0} public repositories.`,
        location: gh.location || undefined,
        avatarUrl: gh.avatar_url,
        links: {
          github: gh.html_url || `https://github.com/${gh.login}`,
          website: gh.blog ? (gh.blog.startsWith('http') ? gh.blog : `https://${gh.blog}`) : undefined,
          twitter: gh.twitter_username ? `https://x.com/${gh.twitter_username}` : undefined,
        },
      };

      return { config, source: `GitHub public profile: @${gh.login}` };
    }
  } catch {}

  throw new Error(
    `Could not find a terminalcard or GitHub profile for "${username}".\n` +
      `  👉 Run "npx terminalcard init" to create your card!`,
  );
}
