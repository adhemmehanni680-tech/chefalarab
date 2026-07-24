import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standaloneDir = join(root, ".next", "standalone");
const publicDir = join(root, "public");
const staticDir = join(root, ".next", "static");

if (!existsSync(standaloneDir)) {
  throw new Error(
    "Standalone output was not generated. Confirm output: 'standalone' in next.config.mjs.",
  );
}

const standalonePublic = join(standaloneDir, "public");
const standaloneNext = join(standaloneDir, ".next");
const standaloneStatic = join(standaloneNext, "static");

rmSync(standalonePublic, { recursive: true, force: true });
rmSync(standaloneStatic, { recursive: true, force: true });
mkdirSync(standaloneNext, { recursive: true });

if (existsSync(publicDir)) {
  cpSync(publicDir, standalonePublic, { recursive: true });
}

if (existsSync(staticDir)) {
  cpSync(staticDir, standaloneStatic, { recursive: true });
}

console.log("Standalone deployment prepared: public and .next/static copied.");
