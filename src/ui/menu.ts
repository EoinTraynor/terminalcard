import { select } from "@inquirer/prompts";
import open from "open";
import chalk from "chalk";
import type { TerminalCardConfig } from "../types.js";

/**
 * Runs an interactive arrow-key menu enabling the user to open links
 * in their default browser, view bio, or create their own card.
 */
export async function runInteractiveMenu(config: TerminalCardConfig): Promise<void> {
  while (true) {
    try {
      const choices: Array<{ name: string; value: string; description?: string }> = [];

      if (config.links.website) {
        choices.push({
          name: `${chalk.hex("#61afef")("🌐")} Open Website`,
          value: `url:${config.links.website}`,
          description: config.links.website,
        });
      }

      if (config.links.github) {
        choices.push({
          name: `${chalk.hex("#98c379")("🐙")} Open GitHub`,
          value: `url:${config.links.github}`,
          description: config.links.github,
        });
      }

      if (config.links.linkedin) {
        choices.push({
          name: `${chalk.hex("#61afef")("💼")} Open LinkedIn`,
          value: `url:${config.links.linkedin}`,
          description: config.links.linkedin,
        });
      }

      if (config.links.twitter) {
        choices.push({
          name: `${chalk.hex("#e5c07b")("🐦")} Open Twitter/X`,
          value: `url:${config.links.twitter}`,
          description: config.links.twitter,
        });
      }

      if (config.links.bluesky) {
        choices.push({
          name: `${chalk.hex("#00f0ff")("🦋")} Open Bluesky`,
          value: `url:${config.links.bluesky}`,
          description: config.links.bluesky,
        });
      }

      if (config.links.mastodon) {
        choices.push({
          name: `${chalk.hex("#bf5af2")("🐘")} Open Mastodon`,
          value: `url:${config.links.mastodon}`,
          description: config.links.mastodon,
        });
      }

      if (config.customLinks) {
        for (const cl of config.customLinks) {
          if (cl.label && cl.url) {
            choices.push({
              name: `${chalk.hex("#e5c07b")("🔗")} Open ${cl.label}`,
              value: `url:${cl.url}`,
              description: cl.url,
            });
          }
        }
      }

      // About & Bio
      choices.push({
        name: `${chalk.hex("#c678dd")("📄")} View About & Bio`,
        value: "bio",
        description: `Learn more about ${config.name}`,
      });

      // Discoverability: Create your own card
      choices.push({
        name: `${chalk.hex("#e5c07b")("⚡")} Create your own card`,
        value: "create",
        description: "Run npx terminalcard init or open github.com/EoinTraynor/terminalcard",
      });

      // Exit
      choices.push({
        name: `${chalk.hex("#e06c75")("🚪")} Exit`,
        value: "exit",
        description: "Close this card",
      });

      const choice = await select({
        message: chalk.hex("#e5e9f0")("What would you like to do?"),
        choices,
      });

      if (choice.startsWith("url:")) {
        const targetUrl = choice.slice(4);
        console.log(chalk.hex("#61afef")(`\n  Opening ${targetUrl}...\n`));
        await open(targetUrl);
      } else if (choice === "bio") {
        const primaryHex = config.theme?.primaryColor || "#00f0ff";
        const companyHex = config.theme?.companyColor || "#ff007f";
        console.log(`\n  ${chalk.hex(primaryHex).bold(config.name)} (@${config.handle})`);
        if (config.jobTitle || config.company) {
          const roleStr = config.jobTitle ? chalk.bold(config.jobTitle) : "";
          const atStr = config.jobTitle && config.company ? " at " : "";
          const companyStr = config.company ? chalk.hex(companyHex).bold(config.company) : "";
          console.log(`  ${roleStr}${atStr}${companyStr}`);
        }
        if (config.tagline) {
          console.log(`  ${chalk.hex("#abb2bf")(config.tagline)}`);
        }
        if (config.location) {
          console.log(`  ${chalk.dim(`Location: ${config.location}`)}`);
        }
        if (config.links.website) {
          console.log(`  Website: ${chalk.hex("#61afef").underline(config.links.website)}`);
        }
        console.log("");
      } else if (choice === "create") {
        console.log(
          `\n  ${chalk.hex("#61afef").bold("terminalcard")} lets you create and run your own interactive terminal business card!\n`,
        );
        console.log("  To build your card, simply run:");
        console.log(`    ${chalk.hex("#98c379").bold("npx terminalcard init")}\n`);
        console.log(`  GitHub: ${chalk.hex("#61afef").underline("https://github.com/EoinTraynor/terminalcard")}\n`);
        await open("https://github.com/EoinTraynor/terminalcard");
      } else if (choice === "exit") {
        console.log(chalk.hex("#98c379")("\n  👋 Thanks for stopping by! Have a great day.\n"));
        return;
      }
    } catch {
      // User pressed Ctrl+C or terminal interrupted
      console.log(chalk.dim("\n  Goodbye!\n"));
      return;
    }
  }
}
