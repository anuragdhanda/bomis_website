const port = process.argv[2];
if (!port) {
  console.error("Usage: node kill-port.mjs <port>");
  process.exit(1);
}

const { execSync } = await import("node:child_process");

function run(cmd) {
  try {
    return execSync(cmd, { shell: true, stdio: "pipe" }).toString();
  } catch {
    return "";
  }
}

const out = run(`netstat -ano | findstr :${port}`);
const pids = new Set();
for (const line of out.split(/\r?\n/)) {
  const m = line.trim().match(/\s+(\d+)\s*$/);
  if (m && /LISTENING/i.test(line)) pids.add(m[1]);
}
for (const pid of pids) {
  run(`taskkill /F /PID ${pid}`);
}
