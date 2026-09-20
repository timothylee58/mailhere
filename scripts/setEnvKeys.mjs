import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const lines = readFileSync("scripts/.env.keys", "utf8").split("\n");
const pairs = lines
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#") && l.includes("="))
  .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)])
  .filter(([, v]) => v.length > 0);

if (pairs.length === 0) {
  console.log("No keys set in scripts/.env.keys — fill it in first.");
  process.exit(1);
}

for (const [name, value] of pairs) {
  execFileSync(
    process.execPath,
    ["node_modules/convex/bin/main.js", "env", "set", "--deployment", "healthy-owl-64", name],
    { input: value, stdio: ["pipe", "ignore", "inherit"] },
  );
  console.log(`set ${name}`);
}
