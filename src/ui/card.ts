import boxen from "boxen";
import chalk from "chalk";
import type { TerminalCardConfig } from "../types.js";

/**
 * Checks whether the current terminal environment supports OSC 8 hyperlinks.
 */
export function supportsHyperlink(): boolean {
  if (process.env.FORCE_HYPERLINK === "0") return false;
  if (process.env.FORCE_HYPERLINK === "1") return true;
  return Boolean(
    process.stdout.isTTY &&
      (process.env.WT_SESSION ||
        process.env.TERM_PROGRAM ||
        process.env.COLORTERM ||
        process.env.VTE_VERSION),
  );
}

/**
 * Creates an OSC 8 terminal hyperlink if supported.
 * Falls back to plain styled text on unsupported or legacy terminals.
 */
export function terminalLink(text: string, url: string): string {
  if (!supportsHyperlink()) {
    return text;
  }
  return `\u001B]8;;${url}\u001B\\${text}\u001B]8;;\u001B\\`;
}

/**
 * Renders a terminal business card from configuration.
 */
export function renderCard(config: TerminalCardConfig, options: { includeSignature?: boolean } = {}): string {
  const includeSignature = options.includeSignature ?? true;

  const primaryHex = config.theme?.primaryColor || "#00f0ff";
  const companyHex = config.theme?.companyColor || "#ff007f";
  const borderHex = config.theme?.borderColor || "#4c566a";

  const name = chalk.hex(primaryHex).bold;
  const handle = chalk.hex("#5c6370");
  const role = chalk.hex("#e5e9f0");
  const company = chalk.hex(companyHex).bold;
  const tagline = chalk.italic.hex("#7f848e");
  const label = chalk.hex("#61afef").bold;
  const url = chalk.hex("#98c379");

  const lines: string[] = [];

  // Header: Name & Handle
  lines.push(`${name(config.name)} ${handle(`(@${config.handle})`)}`);

  // Role & Company
  if (config.jobTitle && config.company) {
    lines.push(`${role(config.jobTitle)} @ ${company(config.company)}`);
  } else if (config.jobTitle) {
    lines.push(role(config.jobTitle));
  } else if (config.company) {
    lines.push(company(config.company));
  }

  // Location
  if (config.location) {
    lines.push(chalk.dim(`📍 ${config.location}`));
  }

  // Tagline
  if (config.tagline) {
    lines.push(tagline(config.tagline));
  }

  // Social Links
  const linkEntries: Array<{ label: string; url: string }> = [];

  if (config.links.website) linkEntries.push({ label: "Website:", url: config.links.website });
  if (config.links.github) linkEntries.push({ label: "GitHub:", url: config.links.github });
  if (config.links.linkedin) linkEntries.push({ label: "LinkedIn:", url: config.links.linkedin });
  if (config.links.twitter) linkEntries.push({ label: "Twitter/X:", url: config.links.twitter });
  if (config.links.bluesky) linkEntries.push({ label: "Bluesky:", url: config.links.bluesky });
  if (config.links.mastodon) linkEntries.push({ label: "Mastodon:", url: config.links.mastodon });

  if (config.customLinks) {
    for (const cl of config.customLinks) {
      if (cl.label && cl.url) {
        linkEntries.push({ label: `${cl.label}:`, url: cl.url });
      }
    }
  }

  if (linkEntries.length > 0) {
    lines.push("");
    // Align labels
    const maxLabelLen = Math.max(...linkEntries.map((l) => l.label.length));
    for (const item of linkEntries) {
      const paddedLabel = item.label.padEnd(maxLabelLen + 1);
      lines.push(`  ${label(paddedLabel)} ${terminalLink(url(item.url), item.url)}`);
    }
  }

  const cardBox = boxen(lines.join("\n"), {
    padding: { top: 1, bottom: 1, left: 2, right: 3 },
    margin: { top: 1, bottom: 0, left: 1, right: 1 },
    borderStyle: "round",
    borderColor: borderHex,
  });

  if (!includeSignature) {
    return cardBox;
  }

  const signature = `  ${chalk.dim("⚡ Powered by ")}${chalk.hex("#61afef")("terminalcard")}${chalk.dim(" · Run ")}${chalk.white.bold("npx terminalcard init")}${chalk.dim(" to create yours")}\n`;

  return `${cardBox}\n${signature}`;
}
