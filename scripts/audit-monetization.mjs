import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const appRoot = join(root, "src", "app");
const routePolicyPath = join(root, "src", "lib", "routePolicy.ts");
const footerPath = join(appRoot, "Components", "footer", "Footer.jsx");
const headerPath = join(appRoot, "Components", "header", "Header.jsx");
const adsenseBannerPath = join(appRoot, "Components", "AdSenseBanner.tsx");
const adsenseScriptPath = join(appRoot, "Components", "AdSenseScript.tsx");
const rootClientPath = join(appRoot, "RootClient.tsx");
const adsTxtPath = join(root, "public", "ads.txt");

const adFreeRoutes = [
  "/privacy_policy",
  "/terms_conditions",
  "/cookie_policy",
  "/contact_us",
  "/about_us",
];

const failures = [];
const notes = [];

function read(path) {
  return readFileSync(path, "utf8");
}

function walkFiles(directory) {
  if (!existsSync(directory)) return [];
  const output = [];
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    const stat = statSync(path);
    if (stat.isDirectory()) output.push(...walkFiles(path));
    else if (/\.(?:js|jsx|ts|tsx)$/.test(name)) output.push(path);
  }
  return output;
}

function requireText(path, text, label) {
  if (!existsSync(path) || !read(path).includes(text)) {
    failures.push(`${label}: expected ${JSON.stringify(text)} in ${relative(root, path)}`);
  }
}

if (!existsSync(routePolicyPath)) {
  failures.push("Missing src/lib/routePolicy.ts");
} else {
  const policy = read(routePolicyPath);
  for (const route of adFreeRoutes) {
    if (!policy.includes(`"${route}"`)) {
      failures.push(`Ad-free route missing from central policy: ${route}`);
    }
  }
}

const forbiddenAdCode = [
  /<AdSenseBanner\b/,
  /<LocalAdBanner\b/,
  /<InterstitialAd\b/,
  /data-ad-slot\s*=/,
  /adsbygoogle\.push/,
];

for (const route of adFreeRoutes) {
  const routeDirectory = join(appRoot, route.slice(1));
  if (!existsSync(routeDirectory)) {
    failures.push(`Required route directory is missing: ${route}`);
    continue;
  }

  for (const file of walkFiles(routeDirectory)) {
    const source = read(file);
    for (const pattern of forbiddenAdCode) {
      if (pattern.test(source)) {
        failures.push(
          `Ad code found on ad-free route ${route}: ${relative(root, file)} (${pattern})`,
        );
      }
    }
  }
}

for (const path of [adsenseBannerPath, adsenseScriptPath, rootClientPath]) {
  requireText(path, "isAdFreePath", "Central ad-free guard");
}

for (const route of [
  "/privacy_policy",
  "/cookie_policy",
  "/terms_conditions",
  "/contact_us",
  "/about_us",
]) {
  requireText(footerPath, `href: "${route}"`, "Footer legal/navigation link");
}
requireText(headerPath, 'href: "/privacy_policy"', "Header privacy link");
requireText(footerPath, "ConsentSettingsButton", "Privacy settings control");

if (!existsSync(adsTxtPath)) {
  failures.push("public/ads.txt is missing");
} else {
  const adsTxt = read(adsTxtPath).trim();
  const expected = "google.com, pub-9717868267549745, DIRECT, f08c47fec0942fa0";
  if (adsTxt !== expected) {
    failures.push(`public/ads.txt does not match the configured publisher. Found: ${adsTxt}`);
  }
}

notes.push(
  "Code guards cover manual ads and direct visits. AdSense Auto ads are account-side, so the same five URLs must also be configured as Page exclusions in AdSense.",
);
notes.push(
  "For EEA/UK/Switzerland traffic, keep a Google-certified IAB TCF CMP published in AdSense Privacy & messaging.",
);

console.log("Monetization / AdSense audit");
console.log(`Ad-free routes checked: ${adFreeRoutes.length}`);
console.log(`Failures: ${failures.length}`);
for (const failure of failures) console.error(`- ${failure}`);
for (const note of notes) console.log(`NOTE: ${note}`);

if (failures.length > 0) process.exitCode = 1;
