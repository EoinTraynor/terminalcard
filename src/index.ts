import chalk from "chalk";
import { resolveCard, detectLocalUser } from "./runner/resolver.js";
import { renderCard } from "./ui/card.js";
import { runInteractiveMenu } from "./ui/menu.js";
import { runInitWizard } from "./init/wizard.js";

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);

  if (rawArgs.includes("--help") || rawArgs.includes("-h")) {
    console.log(`
${chalk.hex("#61afef").bold("terminalcard")} - Universal CLI Business Card Platform

${chalk.bold("Usage:")}
  npx terminalcard <username>       ${chalk.dim("View a developer business card")}
  npx terminalcard init             ${chalk.dim("Interactive card creator wizard")}
  npx terminalcard [options]

${chalk.bold("Options:")}
  -s, --static       ${chalk.dim("Print the card and exit without interactive prompt")}
  -j, --json         ${chalk.dim("Output raw card configuration in JSON format")}
  -v, --version      ${chalk.dim("Show CLI version")}
  -h, --help         ${chalk.dim("Show help menu")}

${chalk.bold("Examples:")}
  npx terminalcard eointraynor
  npx terminalcard torvalds
  npx terminalcard init
  npx terminalcard ./my-card.json --static
`);
    return;
  }

  if (rawArgs.includes("--version") || rawArgs.includes("-v")) {
    console.log("1.0.2");
    return;
  }

  // Filter out flags
  const args = rawArgs.filter((a) => !a.startsWith("-"));
  const isStatic = rawArgs.includes("--static") || rawArgs.includes("-s");
  const isJson = rawArgs.includes("--json") || rawArgs.includes("-j");

  const command = args[0]?.toLowerCase();

  if (command === "init") {
    await runInitWizard();
    return;
  }

  // Target to resolve: explicit arg, or local user fallback
  let target = args[0];
  if (!target) {
    const detected = detectLocalUser();
    if (detected) {
      target = detected;
    } else {
      target = "eointraynor"; // Default showcase card
    }
  }

  try {
    const { config, source } = await resolveCard(target);

    if (isJson) {
      console.log(JSON.stringify(config, null, 2));
      return;
    }

    console.log(renderCard(config));

    const isInteractive = Boolean(process.stdout.isTTY && process.stdin.isTTY) && !isStatic;
    if (isInteractive) {
      await runInteractiveMenu(config);
    }
  } catch (err: any) {
    console.error(chalk.red(`\n✖ ${err.message || err}\n`));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
