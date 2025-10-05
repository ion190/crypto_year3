// node task3.js encrypt 17 secrecy "secretone"
// node task3.js decrypt 17 secrecy "GUQFUHAYU"

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function normalizeInput(s) { return s.toUpperCase().replace(/\s+/g, ""); }

function validateK(k) { if (!Number.isInteger(k) || k < 1 || k > 25) console.log("Error: Key k must be integer between 1 and 25."); }

function makePermutationFromKeyword(keyword) {
  if (!/^[A-Za-z]+$/.test(keyword)) console.log("Error: Permutation key must contain only letters A-Z/a-z.");
  const kw = normalizeInput(keyword);
  if (kw.length < 7) console.log("Error: Permutation key must have length >= 7.");
  let seen = new Set();
  let perm = [];
  for (const ch of kw) { if (!seen.has(ch)) { perm.push(ch); seen.add(ch); } }
  for (const ch of ALPHABET) { if (!seen.has(ch)) { perm.push(ch); seen.add(ch); } }
  return perm.join("");
}
function checkPlainMessage(msg) {
  if (!/^[A-Z]{7,10}$/.test(msg)) console.log("Error: Message must be 7-10 letters (A-Z), no spaces.");
}

function encrypt(k, permKey, message) {
  validateK(k);
  const perm = makePermutationFromKeyword(permKey);
  const m = normalizeInput(message);
  checkPlainMessage(m);
  let out = "";
  for (const ch of m) {
    const idx = ALPHABET.indexOf(ch);
    out += perm[(idx + k) % 26];
  }
  return out;
}
function decrypt(k, permKey, ciphertext) {
  validateK(k);
  const perm = makePermutationFromKeyword(permKey);
  const ct = normalizeInput(ciphertext);
  if (!/^[A-Z]+$/.test(ct)) console.log("Error: Ciphertext must contain only A-Z letters.");
  let out = "";
  for (const ch of ct) {
    const r = perm.indexOf(ch);
    if (r === -1) console.log("Error: Invalid ciphertext: letter not in permuted alphabet.");
    out += ALPHABET[(r - k + 26) % 26];
  }
  return out;
}

const [,, op, keyRaw, permKey, msg] = process.argv;
if (!op) { console.log("Usage:\n  node task3.js encrypt <k> <permKey> <message(7-10 letters)>\n  node caesar_pair.js decrypt <k> <permKey> <ciphertext>"); process.exit(0); }
const k = Number(keyRaw);
if (op === "encrypt") {
  if (!keyRaw || !permKey || !msg) console.log("Error: Missing arguments for encrypt.");
  const ct = encrypt(k, permKey, msg);
  console.log("Original message:", normalizeInput(msg));
  console.log("Permutation key:", permKey);
  console.log("k:", k);
  console.log("Ciphertext:", ct);

  console.log(`Send this to your partner -> cipher:${ct} k:${k} permKey:${permKey}`);
} else if (op === "decrypt") {
  if (!keyRaw || !permKey || !msg) console.log("Error: Missing arguments for decrypt.");
  const pt = decrypt(k, permKey, msg);
  console.log("Decrypted message:", pt);
} else {
  console.log("Error: Operation must be 'encrypt' or 'decrypt'.");
}
