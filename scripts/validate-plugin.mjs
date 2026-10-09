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
if (!Array.isArray(positive) || positive.length !== 6) fail("review.test_cases.positive must contain exactly six cases");
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
const catalogue = JSON.parse(await readFile(resolve(root, "skills/producer-dashboard/references/tool-catalogue.json"), "utf8"));
const toolNames = catalogue.tools?.map((tool) => tool.name) || [];
const uniqueToolNames = new Set(toolNames);
if (!toolNames.length || uniqueToolNames.size !== toolNames.length) fail("catalogue has missing or duplicate tool names");
if (catalogue.release !== packageVersion) fail("catalogue release differs from the package");
if (!/^[a-f0-9]{40}$/.test(catalogue.source_commit || "")) fail("catalogue needs the exact runtime source commit");
if (catalogue.scopes?.length !== 42 || new Set(catalogue.scopes).size !== 42) fail("reviewed parity scope catalogue is incomplete");
for (const tool of catalogue.tools) {
  if (!tool.inputSchema || !tool.annotations || !tool.metadata?.requiredScope) fail(`incomplete tool schema: ${tool.name}`);
  const requiredScopes = [tool.metadata.requiredScope, ...(tool.metadata.additionalScopes || []), ...(tool.metadata.alternativeScopes || []), ...(tool.metadata.alternativeScopeSets || []).flat()];
  if (requiredScopes.some(scope => !catalogue.scopes.includes(scope))) fail(`unknown scope: ${tool.name}`);
}
await access(resolve(root, "skills/producer-dashboard/references/parity-workflows.md"));
if (/\b56 tools\b|Producer Dashboard MCP|The The Library|producerdashboard\.app/i.test(`${skill}\n${await readFile(resolve(root, "README.md"), "utf8")}`)) {
  fail("stale product wording remains in plugin documentation");
}

await access(resolve(root, listing.composerIcon));
await access(resolve(root, listing.logo));
console.log(`Plugin manifest, review metadata, icon paths, ${uniqueToolNames.size}-tool catalogue and parity guide are valid.`);
