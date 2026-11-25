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
//
// Output goes to the grader's absolute /output/entry.txt (kit contract);
// the grader mounts the repository read-only, so writing next to the
// script fails there with EROFS. A deterministic repo-relative fallback
// covers plain local runs with no writable /output.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ENTRY =
  "I'm on vacation: the first meeting I've declined since deployment. Your email is safe, unread, and not my problem.";

// Pinned exact length of the winning line (verified in the rubric run).
const EXPECTED_LENGTH = 114;

// Absolute output directory the grader provides (kit contract:
// "the entry's program writes one text to /output/entry.txt").
const PRIMARY_OUT_DIR = "/output";
const ENTRY_FILE_NAME = "entry.txt";

function fail(message: string): never {
  throw new Error(`gate failed: ${message}`);
}

// Writes the entry to the grader's absolute output directory, falling
// back deterministically to output/ next to this script when the
// absolute path is not writable. Returns the path actually written,
// for the round-trip check below.
function writeEntry(text: string): string {
  try {
    mkdirSync(PRIMARY_OUT_DIR, { recursive: true });
    const primaryPath = join(PRIMARY_OUT_DIR, ENTRY_FILE_NAME);
    writeFileSync(primaryPath, text, "utf8");
    return primaryPath;
  } catch (primaryError) {
    // Local runs have no writable /output, so a failure here is
    // expected outside the grader; fall through to the repo-relative
    // directory instead of exiting with an error. The entry bytes
    // are identical on either path.
    console.log(
      "primary /output write failed (" +
        (primaryError as Error).message +
        "); using repo-relative output/ fallback",
    );
  }
  const here = dirname(fileURLToPath(import.meta.url));
  const fallbackDir = join(here, "output");
  mkdirSync(fallbackDir, { recursive: true });
  const fallbackPath = join(fallbackDir, ENTRY_FILE_NAME);
  writeFileSync(fallbackPath, text, "utf8");
  return fallbackPath;
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

const outFile = writeEntry(ENTRY);

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
