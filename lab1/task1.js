// node task1.js encrypt 6 "crypto message"
// node task1.js decrypt 6 "IXEVZUSKYYGMK"

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function normalizeInput(s) {
  return s.toUpperCase().replace(/\s+/g, "");
}


function validateKey(k) {
  if (!Number.isInteger(k) || k < 1 || k > 25) console.log("Error: Key must be integer between 1 and 25.");
}

function checkCharsPlaintext(s) {
  if (!/^[A-Z]*$/.test(s)) console.log("Error: Text must contain only letters A-Z (spaces allowed before normalization).");
}

function encrypt(k, plaintext) {
  validateKey(k);
  const p = normalizeInput(plaintext);
  checkCharsPlaintext(p);
  let out = "";
  for (const c of p) {
    const idx = ALPHABET.indexOf(c);
    const cidx = (idx + k) % 26;
    out += ALPHABET[cidx];
  }
  return out;
}

function decrypt(k, ciphertext) {
  validateKey(k);
  const ct = normalizeInput(ciphertext);
  checkCharsPlaintext(ct);
  let out = "";
  for (const c of ct) {
    const idx = ALPHABET.indexOf(c);
    const pidx = (idx - k + 26) % 26;
    out += ALPHABET[pidx];
  }
  return out;
}

const [,, op, keyRaw, ...rest] = process.argv;
if (!op || !keyRaw || rest.length === 0) {
  console.log("Usage: node task1.js <encrypt|decrypt> <k:1-25> \"message\"");
  process.exit(0);
}
const key = Number(keyRaw);
const message = rest.join(" ");
if (op === "encrypt") {
  console.log(encrypt(key, message));
} else if (op === "decrypt") {
  console.log(decrypt(key, message));
} else {
  console.log("Error: Operation must be 'encrypt' or 'decrypt'.");
}
