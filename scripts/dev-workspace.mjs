import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";

function runProcess(name, args, extraEnv = {}) {
  const env = {
    ...process.env,
    ...extraEnv,
  };

  const child = isWindows
    ? spawn("cmd.exe", ["/d", "/s", "/c", "pnpm", ...args], {
        stdio: "inherit",
        env,
      })
    : spawn("pnpm", args, {
        stdio: "inherit",
        env,
      });

  child.on("exit", (code, signal) => {
    if (signal) {
      console.log(`${name} stopped with signal ${signal}.`);
      return;
    }

    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}.`);
      shutdown(code);
    }
  });

  return child;
}

const children = [
  runProcess("api-server", ["--filter", "@workspace/api-server", "run", "dev"], {
    PORT: process.env.PORT ?? "8080",
    NODE_ENV: process.env.NODE_ENV ?? "development",
  }),
  runProcess("eye-color-atlas", ["--filter", "@workspace/eye-color-atlas", "run", "dev"], {
    PORT: process.env.WEB_PORT ?? "5173",
    BASE_PATH: process.env.BASE_PATH ?? "/",
  }),
];

let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGINT");
    }
  }

  setTimeout(() => process.exit(exitCode), 200);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
