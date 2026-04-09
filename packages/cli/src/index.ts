import { Command } from "commander";

import packageJson from "../package.json" with { type: "json" };
import { runCheck } from "./commands/check.js";
import { runCommit } from "./commands/commit.js";
import { runDoctor } from "./commands/doctor.js";
import { runFix } from "./commands/fix.js";
import { runInit } from "./commands/init.js";
import { runRetry } from "./commands/retry.js";
import "./ai/index.js";

const program = new Command();

const noAi = (opts: { ai?: boolean }): boolean =>
  opts.ai === false || process.env.BETTER_COMMIT_NO_AI === "1";

program
  .name("better-commit")
  .version(packageJson.version, "-v, --version", "display the version number")
  .description(packageJson.description);

program
  .command("init")
  .description("Initialize better-commit in the current directory")
  .option("-q, --quiet", "Skip prompts")
  .action(async function initAction(this: Command) {
    const opts = this.opts();
    await runInit({ cwd: process.cwd(), quiet: opts.quiet as boolean });
  });

program
  .command("doctor")
  .description("Verify your better-commit setup")
  .action(async () => {
    await runDoctor();
  });

program
  .command("check")
  .description("Validate commit messages against conventional format")
  .option("-e, --edit", "Validate COMMIT_EDITMSG")
  .option("--from <ref>", "Start of range (with --to)")
  .option("--to <ref>", "End of range (with --from)")
  .action(async function checkAction(this: Command) {
    const opts = this.opts();
    await runCheck({
      cwd: process.cwd(),
      edit: opts.edit as boolean,
      from: opts.from as string | undefined,
      to: opts.to as string | undefined,
    });
  });

program
  .command("fix")
  .description("Fix last commit message (amend)")
  .option("--no-ai", "Skip AI, use manual prompts only")
  .action(async function fixAction(this: Command) {
    const opts = this.opts();
    await runFix({ cwd: process.cwd(), noAi: noAi(opts) });
  });

program
  .command("retry")
  .description("Retry commit with cached data")
  .action(async () => {
    await runRetry({ cwd: process.cwd() });
  });

program
  .command("commit", { isDefault: true })
  .description("Create a commit with AI-powered message (default)")
  .option("--dry-run", "Show message without committing")
  .option("--no-ai", "Skip AI, use manual/heuristic only")
  .action(async function commitAction(this: Command) {
    const opts = this.opts();
    await runCommit({
      cwd: process.cwd(),
      dryRun: opts.dryRun as boolean,
      noAi: noAi(opts),
    });
  });

program.parse();
