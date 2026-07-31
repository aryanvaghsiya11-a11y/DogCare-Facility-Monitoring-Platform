import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3001";
const OUT = "screenshots";

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

// --- Login screenshot (static, no wait needed) ---
await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/login.png`, fullPage: false });
console.log("captured /login");

// --- Owner dashboard: wait until a dog pill text appears or skeleton disappears ---
await page.goto(`${BASE}/owner`, { waitUntil: "domcontentloaded", timeout: 30000 });
try {
  await page.waitForFunction(() => {
    const tabs = document.querySelectorAll('[role="tab"]');
    return tabs.length > 0 && [...tabs].some(t => t.textContent && t.textContent.trim().length > 2);
  }, { timeout: 12000 });
  await page.waitForTimeout(800); // let charts and images settle
} catch { await page.waitForTimeout(3000); }
await page.screenshot({ path: `${OUT}/owner.png`, fullPage: false });
console.log("captured /owner");

// --- Staff dashboard: wait for alert items or zone cards ---
await page.goto(`${BASE}/staff`, { waitUntil: "domcontentloaded", timeout: 30000 });
try {
  await page.waitForFunction(() => {
    return document.querySelectorAll("ul[aria-label='Active alerts'] li").length > 0
      || document.querySelector("h1")?.textContent?.includes("Staff");
  }, { timeout: 12000 });
  await page.waitForTimeout(1500);
} catch { await page.waitForTimeout(3000); }
await page.screenshot({ path: `${OUT}/staff.png`, fullPage: false });
console.log("captured /staff");

// --- Manager dashboard: wait for incident rows or stat cards ---
await page.goto(`${BASE}/manager`, { waitUntil: "domcontentloaded", timeout: 30000 });
try {
  await page.waitForFunction(() => {
    const tds = document.querySelectorAll("td");
    return tds.length > 5;
  }, { timeout: 12000 });
  await page.waitForTimeout(1000);
} catch { await page.waitForTimeout(3000); }
await page.screenshot({ path: `${OUT}/manager.png`, fullPage: false });
console.log("captured /manager");

// --- Status page (static) ---
await page.goto(`${BASE}/status`, { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/status.png`, fullPage: false });
console.log("captured /status");

await browser.close();
console.log("done");
