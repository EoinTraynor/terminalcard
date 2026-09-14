import boxen from "boxen";
import chalk from "chalk";
import type { TerminalCardConfig, CustomLink } from "../types.js";

/**
 * Strips ANSI escape sequences and dangerous control characters from untrusted strings.
 */
export function sanitizeText(str?: unknown): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/\u001B\][^\u0007\u001B]*[\u0007]|\u001B\][^\u001B]*\u001B\\/g, "")
    .replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, "")
    .replace(/\u001B[PX^_][^\u001B]*\u001B\\/g, "")
    .replace(/\u001B[@-Z\\-_]/g, "")
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");
}

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
  // Sanitize delimiters inside URL to prevent escape injection
  const safeUrl = url.replace(/[\u001B\u0007]/g, "");
  return `\u001B]8;;${safeUrl}\u001B\\${text}\u001B]8;;\u001B\\`;
}

/**
 * Renders a terminal business card from configuration with defensive validation.
 */
export function renderCard(config: TerminalCardConfig, options: { includeSignature?: boolean } = {}): string {
  const includeSignature = options.includeSignature ?? true;

  const primaryHex = config?.theme?.primaryColor || "#00f0ff";
  const companyHex = config?.theme?.companyColor || "#ff007f";
  const borderHex = config?.theme?.borderColor || "#4c566a";

  const name = chalk.hex(primaryHex).bold;
  const handle = chalk.hex("#5c6370");
  const role = chalk.hex("#e5e9f0");
  const company = chalk.hex(companyHex).bold;
  const tagline = chalk.italic.hex("#7f848e");
  const label = chalk.hex("#61afef").bold;
  const url = chalk.hex("#98c379");

  const lines: string[] = [];

  const safeName = sanitizeText(config?.name || "Anonymous");
  const safeHandle = sanitizeText(config?.handle || "user");
  const safeJobTitle = sanitizeText(config?.jobTitle);
  const safeCompany = sanitizeText(config?.company);
  const rawTagline = sanitizeText(config?.tagline);
  // Truncate excessively long taglines to 500 characters to protect terminal buffer
  const safeTagline = rawTagline.length > 500 ? `${rawTagline.slice(0, 497)}...` : rawTagline;
  const safeLocation = sanitizeText(config?.location);

  // Header: Name & Handle
  lines.push(`${name(safeName)} ${handle(`(@${safeHandle})`)}`);

  // Role & Company
  if (safeJobTitle && safeCompany) {
    lines.push(`${role(safeJobTitle)} @ ${company(safeCompany)}`);
  } else if (safeJobTitle) {
    lines.push(role(safeJobTitle));
  } else if (safeCompany) {
    lines.push(company(safeCompany));
  }

  // Location
  if (safeLocation) {
    lines.push(chalk.dim(`📍 ${safeLocation}`));
  }

  // Tagline
  if (safeTagline) {
    lines.push(tagline(safeTagline));
  }

  // Social Links with defensive fallback
  const links = config?.links && typeof config.links === "object" ? config.links : {};
  const linkEntries: Array<{ label: string; url: string }> = [];

  if (links.website) linkEntries.push({ label: "Website:", url: String(links.website) });
  if (links.github) linkEntries.push({ label: "GitHub:", url: String(links.github) });
  if (links.linkedin) linkEntries.push({ label: "LinkedIn:", url: String(links.linkedin) });
  if (links.twitter) linkEntries.push({ label: "Twitter/X:", url: String(links.twitter) });
  if (links.bluesky) linkEntries.push({ label: "Bluesky:", url: String(links.bluesky) });
  if (links.mastodon) linkEntries.push({ label: "Mastodon:", url: String(links.mastodon) });

  const rawCustomLinks = Array.isArray(config?.customLinks) ? config.customLinks : [];
  for (const cl of rawCustomLinks) {
    if (cl && typeof cl === "object" && cl.label && cl.url) {
      linkEntries.push({ label: `${sanitizeText(cl.label)}:`, url: String(cl.url) });
    }
  }

  if (linkEntries.length > 0) {
    lines.push("");
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
