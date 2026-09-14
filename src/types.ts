export interface CardTheme {
  primaryColor?: string;
  companyColor?: string;
  borderColor?: string;
}

export interface SocialLinks {
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  bluesky?: string;
  mastodon?: string;
  [key: string]: string | undefined;
}

export interface CustomLink {
  label: string;
  url: string;
}

export interface TerminalCardConfig {
  name: string;
  handle: string;
  jobTitle?: string;
  company?: string;
  tagline?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  theme?: CardTheme;
  links: SocialLinks;
  customLinks?: CustomLink[];
}

export interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  company: string;
  border: string;
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  red: {
    id: 'red',
    name: '🔴 CrowdStrike Red',
    primary: '#ff4a4a',
    company: '#ff5555',
    border: '#4c566a',
  },
  cyan: {
    id: 'cyan',
    name: '💎 Cyberpunk Cyan',
    primary: '#00f0ff',
    company: '#ff007f',
    border: '#2e3440',
  },
  emerald: {
    id: 'emerald',
    name: '🌿 Terminal Emerald',
    primary: '#10b981',
    company: '#059669',
    border: '#064e3b',
  },
  purple: {
    id: 'purple',
    name: '🔮 Synthwave Purple',
    primary: '#bf5af2',
    company: '#ff375f',
    border: '#3b2d54',
  },
  slate: {
    id: 'slate',
    name: '❄️ Nordic Slate',
    primary: '#88c0d0',
    company: '#81a1c1',
    border: '#4c566a',
  },
};
