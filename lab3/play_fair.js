 /*   node play_fair.js encrypt "CheiaLuuungă" "Mesaj de test pentru Playfair în limba română" --show-matrix
 *   node play_fair.js decrypt "CheiaLuuungă" "ÎLXÂKFCVAQȚOHGWONOCLȚMLAQJBHLJÂLSPKBGÂ" --show-matrix
 * Options:
 *   --filler=X       litera de umplere (implicit: X)
 *   --show-matrix    afișează matricea Playfair construită din cheie
 */

const USAGE = `
Usage:
  node play_fair.js encrypt <CHEIE> "<MESAJ>"
  node play_fair.js decrypt <CHEIE> "<CRIPTOGRAMĂ>"

Options:
  --filler=X       litera de umplere pentru dubluri/impar (implicit: X)
  --show-matrix    tipărește matricea 6×6 derivată din cheie

Note:
  - Doar litere românești permise (A–Z și diacriticele: Ă, Â, Î, Ș, Ț). Spațiile sunt permise doar în mesaj.
  - Cheia trebuie să aibă lungimea ≥ 7.
  - Decriptarea returnează textul în majuscule (fără spații). Inserările de filler rămân; spațierea se face manual.
`.trim();

const RO_ALPHABET = [
  "A","Ă","Â","B","C","D","E","F","G","H","I","Î","J","K","L","M","N","O",
  "P","Q","R","S","Ș","T","Ț","U","V","W","X","Y","Z"
];
const INDEX = new Map(RO_ALPHABET.map((ch, i) => [ch, i]));

function normalizeRO(str) {
  return str.normalize("NFC")
    .replace(/Ş/g, "Ș").replace(/Ţ/g, "Ț")
    .replace(/ş/g, "ș").replace(/ţ/g, "ț");
}
function toUpperRO(str) { return normalizeRO(str).toUpperCase(); }

function isROLetter(ch) {
  return INDEX.has(toUpperRO(ch));
}
function validateLettersOnly(s, { allowSpaces = false } = {}) {
  for (const ch of s) {
    if (allowSpaces && ch === " ") continue;
    if (!isROLetter(ch)) {
      throw new Error(
        `Caracter invalid: "${ch}". Permise doar litere românești (A–Z cu Ă, Â, Î, Ș, Ț).`
      );
    }
  }
}
function prepKey(key) {
  validateLettersOnly(key);
  key = toUpperRO(key).replace(/\s+/g, "");
  if (key.length < 7) throw new Error(`Cheia trebuie să aibă cel puțin 7 caractere.`);
  return key;
}

function buildPlayfairMatrix(key) {
  key = prepKey(key);

  // eliminate duplicates, keeping only first
  const seen = new Set();
  const cleanedKey = [...key].filter(ch => !seen.has(ch) && seen.add(ch)).join("");

  // remaining alphabet, without key
  const pool = new Set(RO_ALPHABET);
  for (const ch of cleanedKey) pool.delete(ch);

  const ROWS = 6, COLS = 6, SIZE = ROWS * COLS;

  const fillers = ["•", "§", "¤", "µ", "¶"];
  const rest = [...pool].join("") + fillers.join("");
  const cells = (cleanedKey + rest).slice(0, SIZE);

  const grid = [];
  const pos = new Map(); // positions only for ro alphabet
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      const ch = cells[r * COLS + c];
      row.push(ch);
      if (INDEX.has(ch)) pos.set(ch, [r, c]);
    }
    grid.push(row);
  }
  return { grid, pos, ROWS, COLS };
}

function printMatrix(grid) {
  console.error("\n[Playfair 6×6]");
  for (const row of grid) console.error("  " + row.map(x => x.padEnd(2, " ")).join(" "));
  console.error("");
}


function prepPlayfairText(s, filler = "X") {
  filler = toUpperRO(filler);
  if (!INDEX.has(filler)) throw new Error(`Filler invalid: ${filler}. Alege o literă validă (ex: X).`);

  validateLettersOnly(s, { allowSpaces: true });
  const letters = [...toUpperRO(s)].filter(ch => ch !== " ");

  let out = [];
  for (let i = 0; i < letters.length; ) {
    const a = letters[i];
    const b = letters[i + 1];

    if (!b) { // if odd length
      out.push(a, filler);
      i += 1;
    } else if (a === b) { // insert filler between duplicates
      out.push(a, filler);
      i += 1; // remians for next
    } else {
      out.push(a, b);
      i += 2;
    }
  }
  return out.join("");
}


function playfairEncrypt(key, msg, filler = "X", showMatrix = false) {
  const { grid, pos, ROWS, COLS } = buildPlayfairMatrix(key);
  if (showMatrix) printMatrix(grid);
  const P = prepPlayfairText(msg, filler);

  const step = (a, b) => {
    const A = pos.get(a), B = pos.get(b);
    if (!A || !B) throw new Error(`Literă în afara alfabetului (sau filler): ${a} ${b}`);
    const [ra, ca] = A, [rb, cb] = B;

    if (ra === rb) { // same line, on right
      return grid[ra][(ca + 1) % COLS] + grid[rb][(cb + 1) % COLS];
    } else if (ca === cb) { // same column, down
      return grid[(ra + 1) % ROWS][ca] + grid[(rb + 1) % ROWS][cb];
    } else { // crossed column
      return grid[ra][cb] + grid[rb][ca];
    }
  };

  let out = "";
  for (let i = 0; i < P.length; i += 2) out += step(P[i], P[i + 1]);
  return out;
}

function playfairDecrypt(key, ct, filler = "X", showMatrix = false) {
  const { grid, pos, ROWS, COLS } = buildPlayfairMatrix(key);
  if (showMatrix) printMatrix(grid);
  validateLettersOnly(ct);
  const C = toUpperRO(ct);
  if (C.length % 2) throw new Error(`Criptograma trebuie să aibă lungime pară.`);

  const step = (a, b) => {
    const A = pos.get(a), B = pos.get(b);
    if (!A || !B) throw new Error(`Literă în afara alfabetului (sau filler): ${a} ${b}`);
    const [ra, ca] = A, [rb, cb] = B;

    if (ra === rb) { // same line, on left
      return grid[ra][(ca - 1 + COLS) % COLS] + grid[rb][(cb - 1 + COLS) % COLS];
    } else if (ca === cb) { // same column, up
      return grid[(ra - 1 + ROWS) % ROWS][ca] + grid[(rb - 1 + ROWS) % ROWS][cb];
    } else { // crossed column
      return grid[ra][cb] + grid[rb][ca];
    }
  };

  let out = "";
  for (let i = 0; i < C.length; i += 2) out += step(C[i], C[i + 1]);

  return out;
}


function main(argv) {
  if (argv.length < 5) {
    console.log(USAGE);
    return;
  }

  const op = (argv[2] || "").toLowerCase();
  const key = argv[3];
  const text = argv[4] || "";

  let filler = "X";
  let showMatrix = false;
  for (const a of argv.slice(5)) {
    const m = /^--([^=]+)(=(.*))?$/.exec(a);
    if (!m) continue;
    const name = m[1], val = m[3];
    if (name === "filler" && val) filler = val;
    if (name === "show-matrix") showMatrix = true;
  }

  try {
    if (op === "encrypt") {
      const ct = playfairEncrypt(key, text, filler, showMatrix);
      console.log(ct);
    } else if (op === "decrypt") {
      const pt = playfairDecrypt(key, text, filler, showMatrix);
      console.log(pt);
    } else {
      throw new Error("Operație invalidă. Folosește encrypt/decrypt.");
    }
  } catch (e) {
    console.error("Eroare:", e.message);
    process.exit(1);
  }
}

if (require.main === module) main(process.argv);
