# terminalcard 📇

> Universal terminal business card runner & interactive card generator.

[![npm version](https://img.shields.io/npm/v/terminalcard)](https://www.npmjs.com/package/terminalcard)
[![npm downloads](https://img.shields.io/npm/dt/terminalcard)](https://www.npmjs.com/package/terminalcard)
[![license](https://img.shields.io/github/license/EoinTraynor/terminalcard)](LICENSE)
[![CI](https://github.com/EoinTraynor/terminalcard/actions/workflows/ci.yml/badge.svg)](https://github.com/EoinTraynor/terminalcard/actions)

`terminalcard` enables any developer to run, showcase, and create interactive terminal business cards without fighting for squatted package names, managing npm 2FA, or configuring complex CI pipelines.

---

## 🚀 Quickstart

View any developer's terminal card directly via `npx` (no installation required):

```bash
# View a community card
npx terminalcard eointraynor

# View ANY GitHub user's dynamic card on the fly!
npx terminalcard torvalds
npx terminalcard gaearon

# View your own card (auto-detects local git/GitHub username)
npx terminalcard
```

---

## ✨ Create Your Own Card (Zero NPM Account Needed)

Run the interactive creator wizard:

```bash
npx terminalcard init
```

The wizard guides you through:
1. Your name, job title, company, and bio.
2. **Social profiles**: Website, GitHub, LinkedIn, Twitter/X, Bluesky, Mastodon, and custom links.
3. Smart handle & URL normalization (accepts `@handle`, plain `handle`, or full URLs).
4. Color palette themes (`CrowdStrike Red`, `Cyberpunk Cyan`, `Terminal Emerald`, `Synthwave Purple`, `Nordic Slate`).
5. Live terminal preview of your card before saving.

### 🌐 How to Deploy in 30 Seconds

Once the wizard writes `.terminalcard.json`:

1. Move `.terminalcard.json` into your personal GitHub profile repository (`github.com/<your-username>/<your-username>`).
2. Commit and push:
   ```bash
   git add .terminalcard.json
   git commit -m "feat: add terminal business card"
   git push
   ```
3. That's it! Anyone in the world can now run:
   ```bash
   npx terminalcard <your-username>
   ```

*(You can also submit a PR adding `cards/<your-username>.json` directly to this repository!)*

---

## ⚙️ CLI Options

```bash
Usage:
  npx terminalcard <username>       View a developer business card
  npx terminalcard init             Interactive card creator wizard
  npx terminalcard [options]

Options:
  -s, --static       Print the card and exit without interactive prompt
  -j, --json         Output raw card configuration in JSON format
  -v, --version      Show CLI version
  -h, --help         Show help menu

Examples:
  npx terminalcard eointraynor
  npx terminalcard torvalds --static
  npx terminalcard ./my-card.json
```

---

## ⚡ Features

- ⚡ **Zero Runtime Dependencies**: Bundled into a standalone binary with zero runtime npm dependencies.
- 🔗 **Clickable OSC 8 Hyperlinks**: Click links directly in supported terminals with graceful degradation on legacy terminals.
- 🎯 **No "NPM Tax"**: Zero npm registry accounts, tokens, or 2FA required for card owners.
- 🌐 **Waterfall Resolution**:
  1. Checks `github.com/<user>/<user>/main/.terminalcard.json`
  2. Checks built-in community registry in `cards/<user>.json`
  3. Dynamically generates a card from public GitHub API profiles for any developer
- ⌨️ **Interactive Arrow Menu**: Arrow-key navigation to launch websites, socials, read bio, or create cards.
- 🛡️ **Defensive & CI-Friendly**: Automatically detects non-TTY environments and prints static output cleanly.

---

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/EoinTraynor/terminalcard.git
cd terminalcard

# Install dependencies
npm install

# Run unit tests
npm test

# Typecheck
npm run typecheck

# Build standalone distribution bundle
npm run build

# Test local build
node dist/index.js eointraynor --static
```

---

## 📄 License

MIT © [Eoin Traynor](https://eointraynor.com)
