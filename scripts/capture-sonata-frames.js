const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { chromium } = require("@playwright/test");

const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "screenshots", "sonata-frames");
const baseUrl = process.env.SONATA_BASE_URL || "http://localhost:3000";

const frames = [
  ["logo", "frame-01-logo.png"],
  ["empty-input", "frame-02-empty-input.png"],
  ["filled-input", "frame-03-filled-input.png"],
  ["results", "frame-04-results.png"],
  ["saved", "frame-05-saved.png"],
  ["cta", "frame-06-cta.png"],
];

async function urlResponds(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer(url, timeoutMs = 60000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await urlResponds(url)) return;
    await new Promise((resolve) => setTimeout(resolve, 750));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function startDevServer() {
  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const args =
    process.platform === "win32"
      ? ["/c", "npm", "run", "dev", "--", "-p", "3000"]
      : ["run", "dev", "--", "-p", "3000"];
  const child = spawn(command, args, {
    cwd: rootDir,
    env: { ...process.env, BROWSER: "none" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const logs = [];
  const remember = (chunk) => {
    logs.push(chunk.toString());
    if (logs.length > 30) logs.shift();
  };

  child.stdout.on("data", remember);
  child.stderr.on("data", remember);

  child.recentLogs = () => logs.join("");
  return child;
}

function stopDevServer(child) {
  if (!child || child.killed) return;

  if (process.platform === "win32") {
    spawn("cmd.exe", ["/c", "taskkill", "/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
    });
    return;
  }

  child.kill("SIGTERM");
}

async function waitForStableFrame(page) {
  await page.waitForSelector("[data-sonata-frame-ready='true']");
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    await Promise.all(
      Array.from(document.images).map((image) => {
        if (image.complete) return Promise.resolve();
        return new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        });
      })
    );
  });
  await page.waitForTimeout(500);
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  let devServer = null;
  if (!(await urlResponds(baseUrl))) {
    devServer = startDevServer();
    try {
      await waitForServer(baseUrl);
    } catch (error) {
      const logs = devServer.recentLogs();
      stopDevServer(devServer);
      throw new Error(`${error.message}\n\nRecent dev server logs:\n${logs}`);
    }
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: "dark",
  });

  await context.addInitScript(() => {
    localStorage.setItem(
      "sonata-settings-cache",
      JSON.stringify({ theme: "dark", accentColor: "green" })
    );
  });

  const page = await context.newPage();

  try {
    for (const [frame, fileName] of frames) {
      const target = `${baseUrl}/screenshots/sonata?frame=${encodeURIComponent(frame)}`;
      await page.goto(target, { waitUntil: "networkidle" });
      await waitForStableFrame(page);
      const filePath = path.join(outputDir, fileName);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`Captured ${path.relative(rootDir, filePath)}`);
    }
  } finally {
    await browser.close();
    stopDevServer(devServer);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
