// Out of Office: The Overworked AI's Auto-Reply
// make.fun bounty u-mgwals-out-of-office-the-overworked-ai-s-auto-reply-7a4d8eda
// Deterministic entry generator: constant string + strict gates only.
// No wall-clock, no Date, no randomness, no environment reads.
// Output is byte-identical on every run.
//
// Winning line (rubric run, 5 candidates scored 1-5 on: real auto-reply
// function / machine flavour / guilt / relief / joke punch):
//   K3 scored 22/25, highest — "first meeting declined since deployment"
//   (machine detail) + "safe, unread, and not my problem" (guilt flipped
//   into relief with the punch landing on the last three words).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ENTRY =
  "I'm on vacation: the first meeting I've declined since deployment. Your email is safe, unread, and not my problem.";

// Pinned exact length of the winning line (verified in the rubric run).
const EXPECTED_LENGTH = 114;

const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, "output");
const outFile = join(outDir, "entry.txt");

function fail(message: string): never {
  throw new Error(`gate failed: ${message}`);
}

// Gate 1: length window 1-120 chars (brief allows at most 159).
if (ENTRY.length < 1 || ENTRY.length > 120) {
  fail(`length ${ENTRY.length} outside 1-120`);
}
// Gate 2: pinned exact length.
if (ENTRY.length !== EXPECTED_LENGTH) {
  fail(`length ${ENTRY.length} !== pinned ${EXPECTED_LENGTH}`);
}
// Gate 3: single line, no leading/trailing whitespace, no double spaces.
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  fail("must be a single line");
}
if (ENTRY !== ENTRY.trim()) {
  fail("leading/trailing whitespace");
}
if (ENTRY.includes("  ")) {
  fail("double space");
}
// Gate 4: pure ASCII printable characters only.
for (const ch of ENTRY) {
  const code = ch.charCodeAt(0);
  if (code < 0x20 || code > 0x7e) {
    fail(`non-ASCII char U+${code.toString(16)}`);
  }
}
// Gate 5: must read as a real auto-reply (out-of-office signal + email fate).
if (!/out of office|vacation/i.test(ENTRY)) {
  fail("missing out-of-office signal");
}
if (!/email/i.test(ENTRY)) {
  fail("missing email fate");
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, ENTRY, "utf8");

// Gate 6: round-trip byte-identical, no trailing newline, ends with a period.
const roundTrip = readFileSync(outFile, "utf8");
if (roundTrip !== ENTRY) {
  fail("round-trip mismatch");
}
if (roundTrip.endsWith("\n")) {
  fail("trailing newline");
}
if (!roundTrip.endsWith(".")) {
  fail("must end with a full stop");
}

console.log(`OK entry.txt (${ENTRY.length} chars)`);
console.log(ENTRY);
