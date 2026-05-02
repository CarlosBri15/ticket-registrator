#!/usr/bin/env node
/**
 * Pre-commit quality gate (Frente 5.2).
 *
 * Runs `tsc --noEmit` on every workspace that has staged changes. Type errors
 * are the cheapest and highest-signal block — running them here prevents the
 * "ship a broken build" class of regression while staying fast (only affected
 * packages are typechecked).
 *
 * The 229 pre-existing ESLint findings are out of scope here; they will be
 * batched in Frente 5.4 (Sonar deep clean) and at that point we will turn on
 * lint-staged with strict ESLint enforcement.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = process.cwd();

// Map each top-level workspace folder under `packages/` to the tsc invocation
// that would surface a type regression for that package.
const PACKAGE_TYPECHECKS = [
  { dir: "packages/shared",   cmd: "npx tsc --noEmit" },
  { dir: "packages/frontend", cmd: "npx tsc -b --noEmit" },
  { dir: "packages/backend",  cmd: "npx tsc -p tsconfig.build.json --noEmit" },
  // Mobile is excluded — Expo + Metro bundler validates types at build time
  // and the typecheck step is significantly slower than the others. Re-enable
  // once we land a faster `tsc --noEmit` script in `packages/mobile`.
];

function getStagedFiles() {
  const out = execSync("git diff --cached --name-only --diff-filter=ACMR", {
    encoding: "utf8",
  });
  return out
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function colour(code, msg) {
  return process.stdout.isTTY ? `[${code}m${msg}[0m` : msg;
}

const staged = getStagedFiles();
if (staged.length === 0) {
  console.log("[precommit] No staged files — skipping typecheck.");
  process.exit(0);
}

const affected = PACKAGE_TYPECHECKS.filter(({ dir }) =>
  staged.some((f) => f.startsWith(`${dir}/`)),
);

if (affected.length === 0) {
  console.log("[precommit] No typescript packages affected — skipping typecheck.");
  process.exit(0);
}

let failed = false;
for (const { dir, cmd } of affected) {
  const cwd = join(REPO_ROOT, dir);
  if (!existsSync(cwd)) continue;

  console.log(colour("36", `\n[precommit] Typecheck → ${dir}`));
  console.log(colour("90", `           $ ${cmd}`));
  try {
    execSync(cmd, { cwd, stdio: "inherit" });
  } catch {
    failed = true;
  }
}

if (failed) {
  console.error(
    colour(
      "31",
      "\n[precommit] Typecheck failed. Fix the errors or re-run with --no-verify if you really know what you are doing.",
    ),
  );
  process.exit(1);
}

console.log(colour("32", "\n[precommit] Typecheck OK ✓"));
