import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const targets = [".next", "tsconfig.tsbuildinfo"].map((name) =>
  join(process.cwd(), name),
);

for (const target of targets) {
  if (!existsSync(target)) continue;

  rmSync(target, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 250,
  });
}

console.log("Build cache cleaned.");
