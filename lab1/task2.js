// node task2.js encrypt 3 secrecy "text that was crypted"
// node task2.js decrypt 3 secrecy "VDSVVHRVZRUATEPVDB"

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function normalizeInput(s) { return s.toUpperCase().replace(/\s+/g, ""); }

function makePermutationFromKeyword(keyword) {
  if (!/^[A-Za-z]+$/.test(keyword)) console.log("Error: Permutation key must contain only letters A-Z/a-z.");
  const kw = normalizeInput(keyword);
  if (kw.length < 7) console.log("Error: Permutation key must have length >= 7.");

  let seen = new Set();
  let perm = [];
  for (const ch of kw) {
    if (!seen.has(ch)) { perm.push(ch); seen.add(ch); }
  }
  for (const ch of ALPHABET) {
    if (!seen.has(ch)) { perm.push(ch); seen.add(ch); }
  }
  if (perm.length !== 26) console.log("Error: Permutation generation failed.");
  return perm.join("");
}

function validateKey(k) { if (!Number.isInteger(k) || k < 1 || k > 25) console.log("Error: Key must be integer between 1 and 25."); }

function checkLettersOnly(s) { if (!/^[A-Z]*$/.test(s)) console.log("Error: Text must contain only letters A-Z (spaces allowed before normalization)."); }

function encrypt(k, permKey, plaintext) {
  validateKey(k);
  const perm = makePermutationFromKeyword(permKey);
  const pt = normalizeInput(plaintext);
  checkLettersOnly(pt);
  let out = "";
  for (const ch of pt) {
    const idx = ALPHABET.indexOf(ch);
    const cidx = (idx + k) % 26;
    out += perm[cidx];
  }
  return out;
}

function decrypt(k, permKey, ciphertext) {
  validateKey(k);
  const perm = makePermutationFromKeyword(permKey);
  const ct = normalizeInput(ciphertext);
  checkLettersOnly(ct);
  let out = "";
  for (const ch of ct) {
    const r = perm.indexOf(ch);
    if (r === -1) console.log("Error: Invalid ciphertext letter (not in permuted alphabet).");
    const pidx = (r - k + 26) % 26;
    out += ALPHABET[pidx];
  }
  return out;
}

const [,, op, keyRaw, permKey, ...rest] = process.argv;
if (!op || !keyRaw || !permKey || rest.length === 0) {
  console.log("Usage: node task2.js <encrypt|decrypt> <k:1-25> <perm-key (letters, len>=7)> \"message\"");
  process.exit(0);
}
const k = Number(keyRaw);
const message = rest.join(" ");
if (op === "encrypt") {
  console.log(encrypt(k, permKey, message));
} else if (op === "decrypt") {
  console.log(decrypt(k, permKey, message));
}
