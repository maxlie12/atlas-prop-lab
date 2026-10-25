import { spawnSync } from "node:child_process";
import fs from "node:fs";

// Runs every scripts/validate-*.mjs so CI and local checks cover the same set.
const dir = new URL("./", import.meta.url);
const scripts = fs.readdirSync(dir).filter(name => /^validate-.+\.mjs$/.test(name) && name !== "validate-all.mjs").sort();
let failed = 0;
for (const name of scripts) {
  const result = spawnSync(process.execPath, [new URL(name, dir).pathname.replace(/^\/([A-Za-z]:)/, "$1")], { encoding: "utf8" });
  const ok = result.status === 0;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `\n${(result.stderr || result.stdout).trim()}`}`);
}
console.log(`${scripts.length - failed}/${scripts.length} validators passed.`);
process.exit(failed ? 1 : 0);
