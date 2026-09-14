import { input, select, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { normalizeSocialLink } from "./normalize.js";
import { renderCard } from "../ui/card.js";
import { detectLocalUser } from "../runner/resolver.js";
import { THEME_PRESETS } from "../types.js";
import type { TerminalCardConfig, CustomLink } from "../types.js";

/**
 * Runs the interactive terminalcard creator wizard.
 */
export async function runInitWizard(): Promise<void> {
  console.log(chalk.hex("#61afef").bold("\n📇 Welcome to terminalcard init!\n"));
  console.log(chalk.dim("Answer a few quick questions to create your interactive terminal business card.\n"));

  const detectedUser = detectLocalUser() || "";

  // 1. Personal Identity
  const name = await input({
    message: "What is your full name?",
    validate: (val) => (val.trim().length > 0 ? true : "Name is required"),
  });

  const defaultHandle = detectedUser || name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const rawHandle = await input({
    message: "What is your primary handle or GitHub username?",
    default: defaultHandle,
    validate: (val) => (val.trim().length > 0 ? true : "Handle is required"),
  });
  const handle = rawHandle.replace(/^@/, "").trim();

  // 2. Professional Details
  const jobTitle = await input({
    message: "Job title or role (e.g. Engineering Manager, SRE, Student):",
  });

  const company = await input({
    message: "Company or organization (optional):",
  });

  const tagline = await input({
    message: "Tagline or short bio (optional):",
  });

  const location = await input({
    message: "Location (e.g. San Francisco, CA / Berlin) (optional):",
  });

  // 3. Social Profiles Matrix
  console.log(chalk.hex("#61afef")("\n🌐 Social Profiles (press Enter to skip any):\n"));

  const rawWebsite = await input({ message: "Personal Website or Blog URL:" });
  const rawGithub = await input({ message: "GitHub handle or URL:", default: handle });
  const rawLinkedin = await input({ message: "LinkedIn handle or profile URL:" });
  const rawTwitter = await input({ message: "Twitter/X handle or URL:" });
  const rawBluesky = await input({ message: "Bluesky handle or URL:" });
  const rawMastodon = await input({ message: "Mastodon handle or URL (@user@instance):" });

  const customLinks: CustomLink[] = [];
  const addCustom = await confirm({
    message: "Would you like to add a custom link (e.g. Substack, YouTube, Twitch)?",
    default: false,
  });

  if (addCustom) {
    const customLabel = await input({ message: "Custom link label (e.g. Substack):" });
    const customUrl = await input({ message: "Custom URL:" });
    if (customLabel.trim() && customUrl.trim()) {
      const normalized = normalizeSocialLink("custom", customUrl.trim());
      if (normalized) {
        customLinks.push({ label: customLabel.trim(), url: normalized.url });
      }
    }
  }

  // 4. Color Palette
  const themeChoice = await select({
    message: "Select a color theme for your card:",
    choices: [
      { name: "🔴 CrowdStrike Red", value: "red" },
      { name: "💎 Cyberpunk Cyan", value: "cyan" },
      { name: "🌿 Terminal Emerald", value: "emerald" },
      { name: "🔮 Synthwave Purple", value: "purple" },
      { name: "❄️ Nordic Slate", value: "slate" },
    ],
  });

  const selectedTheme = THEME_PRESETS[themeChoice] || THEME_PRESETS.cyan;

  // Normalize links
  const links: Record<string, string | undefined> = {};
  const normWebsite = normalizeSocialLink("website", rawWebsite);
  if (normWebsite) links.website = normWebsite.url;

  const normGithub = normalizeSocialLink("github", rawGithub);
  if (normGithub) links.github = normGithub.url;

  const normLinkedin = normalizeSocialLink("linkedin", rawLinkedin);
  if (normLinkedin) links.linkedin = normLinkedin.url;

  const normTwitter = normalizeSocialLink("twitter", rawTwitter);
  if (normTwitter) links.twitter = normTwitter.url;

  const normBluesky = normalizeSocialLink("bluesky", rawBluesky);
  if (normBluesky) links.bluesky = normBluesky.url;

  const normMastodon = normalizeSocialLink("mastodon", rawMastodon);
  if (normMastodon) links.mastodon = normMastodon.url;

  const config: TerminalCardConfig = {
    name: name.trim(),
    handle,
    jobTitle: jobTitle.trim() || undefined,
    company: company.trim() || undefined,
    tagline: tagline.trim() || undefined,
    location: location.trim() || undefined,
    theme: {
      primaryColor: selectedTheme.primary,
      companyColor: selectedTheme.company,
      borderColor: selectedTheme.border,
    },
    links,
    customLinks: customLinks.length > 0 ? customLinks : undefined,
  };

  // 5. Live Preview
  console.log(chalk.hex("#98c379").bold("\n✨ Card Preview:\n"));
  console.log(renderCard(config, { includeSignature: true }));

  const confirmed = await confirm({
    message: "Does this look good to you?",
    default: true,
  });

  if (!confirmed) {
    console.log(chalk.yellow("\nCard generation cancelled. You can run \"npx terminalcard init\" anytime to try again!\n"));
    return;
  }

  // 6. Write Configuration
  const targetPath = resolve(process.cwd(), ".terminalcard.json");
  writeFileSync(targetPath, JSON.stringify(config, null, 2) + "\n", "utf8");

  console.log(chalk.hex("#98c379").bold(`\n🎉 Success! Saved your card config to: ${targetPath}\n`));
  console.log(chalk.white.bold("Next Steps to publish and share your card:\n"));
  console.log(chalk.hex("#61afef").bold("Option 1 (Recommended — Zero npm account needed):"));
  console.log(`  1. Move ${chalk.white.bold(".terminalcard.json")} into your GitHub profile repository:`);
  console.log(`     ${chalk.hex("#98c379")(`https://github.com/${handle}/${handle}`)}`);
  console.log("  2. Commit and push:");
  console.log(chalk.dim("     git add .terminalcard.json"));
  console.log(chalk.dim("     git commit -m \"feat: add terminalcard\""));
  console.log(chalk.dim("     git push"));
  console.log(`  3. Now anyone in the world can run:`);
  console.log(`     ${chalk.hex("#98c379").bold(`npx terminalcard ${handle}`)}\n`);

  console.log(chalk.hex("#61afef").bold("Option 2 (Submit to Community Registry):"));
  console.log(`  Submit a PR adding ${chalk.white.bold(`cards/${handle}.json`)} to:`);
  console.log(`  ${chalk.hex("#61afef").underline("https://github.com/EoinTraynor/terminalcard")}\n`);
}
