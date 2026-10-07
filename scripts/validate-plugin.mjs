import { readFile } from "node:fs/promises";
import { access } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const manifestPath = resolve(root, "plugin.json");
const skillPath = resolve(root, "skills/producer-dashboard/SKILL.md");

const fail = (message) => {
  throw new Error(message);
};

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const claudeManifest = JSON.parse(await readFile(resolve(root, ".claude-plugin/plugin.json"), "utf8"));
const marketplace = JSON.parse(await readFile(resolve(root, ".claude-plugin/marketplace.json"), "utf8"));
const packageVersion = manifest.version;
if (typeof packageVersion !== "string" || !/^\d+\.\d+\.\d+$/.test(packageVersion)) fail("plugin.json version must be semver-like");
if (claudeManifest.version !== packageVersion) fail(".claude-plugin/plugin.json version is out of sync");
if (marketplace.metadata?.version !== packageVersion) fail("marketplace metadata version is out of sync");
const marketplacePlugin = marketplace.plugins?.find((plugin) => plugin.name === manifest.name);
if (!marketplacePlugin || marketplacePlugin.version !== packageVersion) fail("marketplace plugin version is out of sync");
const openai = manifest.extensions?.["com.openai"];
const listing = openai?.interface;
const review = openai?.review;

if (!listing) fail("extensions.com.openai.interface is required");
for (const field of ["displayName", "shortDescription", "longDescription", "developerName", "category", "websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL", "composerIcon", "logo"]) {
  if (typeof listing[field] !== "string" || listing[field].trim() === "") fail(`missing listing field: ${field}`);
}
for (const field of ["displayName", "shortDescription", "developerName"]) {
  if (listing[field].length > (field === "developerName" ? 80 : 30)) fail(`${field} exceeds submission limit`);
}
if (listing.longDescription.length > 4000) fail("longDescription exceeds submission limit");
for (const field of ["websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"]) {
  if (!/^https:\/\//.test(listing[field])) fail(`${field} must use HTTPS`);
}
for (const prompt of Array.isArray(listing.defaultPrompt) ? listing.defaultPrompt : [listing.defaultPrompt]) {
  if (typeof prompt !== "string" || prompt.length > 128 || /@\w+/.test(prompt)) fail("invalid defaultPrompt");
}

const positive = review?.test_cases?.positive;
const negative = review?.test_cases?.negative;
if (!Array.isArray(positive) || positive.length !== 5) fail("review.test_cases.positive must contain exactly five cases");
if (!Array.isArray(negative) || negative.length !== 3) fail("review.test_cases.negative must contain exactly three cases");
for (const [index, testCase] of [...positive, ...negative].entries()) {
  for (const field of ["description", "prompt"]) {
    if (typeof testCase[field] !== "string" || testCase[field].trim() === "") fail(`review test case ${index + 1} missing ${field}`);
  }
}
for (const [index, testCase] of positive.entries()) {
  for (const field of ["tools_triggered", "expected_behavior"]) {
    if (typeof testCase[field] !== "string" || testCase[field].trim() === "") fail(`positive review case ${index + 1} missing ${field}`);
  }
}

const skill = await readFile(skillPath, "utf8");
const toolReference = skill.split("## Response Formatting Rules")[0];
const toolNames = [...toolReference.matchAll(/^\s*- `([a-z0-9_]+)`\s*$/gm)].map((match) => match[1]);
const uniqueToolNames = new Set(toolNames);
if (uniqueToolNames.size !== 85) fail(`skill tool reference contains ${uniqueToolNames.size} tools; expected 85`);
if (/\b56 tools\b|Producer Dashboard MCP|The The Library|producerdashboard\.app/i.test(`${skill}\n${await readFile(resolve(root, "README.md"), "utf8")}`)) {
  fail("stale product wording remains in plugin documentation");
}

await access(resolve(root, listing.composerIcon));
await access(resolve(root, listing.logo));
console.log("Plugin manifest, review metadata, icon paths, and 85-tool skill reference are valid.");
