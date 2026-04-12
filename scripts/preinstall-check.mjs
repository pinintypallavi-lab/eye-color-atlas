import { rm } from "node:fs/promises";

const userAgent = process.env.npm_config_user_agent ?? "";

await Promise.all([
  rm(new URL("../package-lock.json", import.meta.url), { force: true }),
  rm(new URL("../yarn.lock", import.meta.url), { force: true }),
]);

if (!userAgent.startsWith("pnpm/")) {
  console.error("Use pnpm instead.");
  process.exit(1);
}
