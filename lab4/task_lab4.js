// des_lab_tasks.js
// DES implementation + console outputs for lab tasks 2.1..2.11 (from the uploaded PDF).
// Usage: node des_lab_tasks.js
//
// Default example values (change as needed near the top):
// - keyHex: DES key (64 bits, hex)
// - plainHex: 64-bit block plaintext (hex)
// - TASK_I, TASK_K, TASK_J: indices used for "given i/k/j" problems (1-based where appropriate)

const IP = [58,50,42,34,26,18,10,2,60,52,44,36,28,20,12,4,62,54,46,38,30,22,14,6,64,56,48,40,32,24,16,8,57,49,41,33,25,17,9,1,59,51,43,35,27,19,11,3,61,53,45,37,29,21,13,5,63,55,47,39,31,23,15,7];
const FP = [40,8,48,16,56,24,64,32,39,7,47,15,55,23,63,31,38,6,46,14,54,22,62,30,37,5,45,13,53,21,61,29,36,4,44,12,52,20,60,28,35,3,43,11,51,19,59,27,34,2,42,10,50,18,58,26,33,1,41,9,49,17,57,25];
const E = [32,1,2,3,4,5,4,5,6,7,8,9,8,9,10,11,12,13,12,13,14,15,16,17,16,17,18,19,20,21,20,21,22,23,24,25,24,25,26,27,28,29,28,29,30,31,32,1];
const P = [16,7,20,21,29,12,28,17,1,15,23,26,5,18,31,10,2,8,24,14,32,27,3,9,19,13,30,6,22,11,4,25];
const PC1 = [57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4];
const PC2 = [14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32];
const SHIFTS = [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];
const SBOX = [
  [[14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7],[0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8],[4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0],[15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13]],
  [[15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10],[3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5],[0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15],[13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9]],
  [[10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8],[13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1],[13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7],[1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12]],
  [[7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15],[13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9],[10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4],[3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14]],
  [[2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9],[14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6],[4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14],[11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3]],
  [[12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11],[10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8],[9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6],[4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13]],
  [[4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1],[13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6],[1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2],[6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12]],
  [[13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7],[1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2],[7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8],[2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11]]
];

// --- Bit utilities ---
function hexToBits(hex) {
  const bits = [];
  hex = hex.replace(/^0x/i, '');
  for (let i = 0; i < hex.length; i++) {
    const v = parseInt(hex[i], 16);
    for (let b = 3; b >= 0; b--) bits.push((v >> b) & 1);
  }
  return bits;
}
function bitsToHex(bits) {
  let hex = '';
  for (let i = 0; i < bits.length; i += 4) {
    let nib = 0;
    for (let j = 0; j < 4; j++) nib = (nib << 1) | (bits[i + j] || 0);
    hex += nib.toString(16);
  }
  return hex.toUpperCase();
}
function bitsToBin(bits) { return bits.map(b => b ? '1' : '0').join(''); }
function asciiToBits(str) {
  const bits = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    for (let b = 7; b >= 0; b--) bits.push((code >> b) & 1);
  }
  return bits;
}
function permute(bits, table) { return table.map(i => bits[i - 1]); }
function leftRotate(arr, n) { return arr.slice(n).concat(arr.slice(0, n)); }
function xorBits(a, b) { return a.map((bit, i) => bit ^ (b[i] || 0)); }

// --- Key schedule + f function (same as before) ---
function generateRoundKeys(key64bits, nRounds = 16, verbose = false) {
  const key56 = permute(key64bits, PC1);
  const C0 = key56.slice(0, 28);
  const D0 = key56.slice(28, 56);
  let C = C0.slice(), D = D0.slice();
  const roundKeys = [];
  for (let i = 0; i < nRounds; i++) {
    C = leftRotate(C, SHIFTS[i]);
    D = leftRotate(D, SHIFTS[i]);
    const CD = C.concat(D);
    const Ki = permute(CD, PC2);
    roundKeys.push(Ki);
  }
  return { roundKeys, C0, D0 };
}
function sboxSubstitution(bits48) {
  const out32 = [];
  for (let i = 0; i < 8; i++) {
    const block = bits48.slice(i*6, i*6 + 6);
    const row = (block[0] << 1) | block[5];
    const col = (block[1] << 3) | (block[2] << 2) | (block[3] << 1) | block[4];
    const val = SBOX[i][row][col];
    out32.push((val >> 3) & 1, (val >> 2) & 1, (val >> 1) & 1, val & 1);
  }
  return out32;
}
function fFunction(R32, K48) {
  const expanded = permute(R32, E);
  const xored = xorBits(expanded, K48);
  const sboxed = sboxSubstitution(xored);
  const permuted = permute(sboxed, P);
  return { expanded, xored, sboxed, permuted };
}

// --- DES block encrypt (16 rounds by default) ---
function desEncryptBlock(block64bits, roundKeys, verbose=false) {
  let ip = permute(block64bits, IP);
  let L = ip.slice(0,32), R = ip.slice(32,64);
  for (let i = 0; i < roundKeys.length; i++) {
    const { permuted } = fFunction(R, roundKeys[i]);
    const newR = xorBits(L, permuted);
    L = R;
    R = newR;
  }
  const preoutput = R.concat(L);
  const ciphertext = permute(preoutput, FP);
  return { ciphertext, L, R }; // L and R are the halves after last round
}

// --- Helper functions for tasks ---
// Convert a 48-bit array to array of eight 6-bit blocks (B1..B8)
function split6(bits48) {
  const blocks = [];
  for (let i = 0; i < 8; i++) blocks.push(bits48.slice(i*6, i*6+6));
  return blocks;
}
// Compute S-box j (1-based) on a 6-bit block
function sboxJ(j, block6) {
  const row = (block6[0] << 1) | block6[5];
  const col = (block6[1] << 3) | (block6[2] << 2) | (block6[3] << 1) | block6[4];
  const val = SBOX[j-1][row][col];
  const bits = [ (val>>3)&1, (val>>2)&1, (val>>1)&1, val&1 ];
  return { val, bits };
}

// ---------------------------
// MAIN: run tasks 2.1..2.11
// ---------------------------
if (require && require.main === module) {
  // === Customize these defaults ===
  const keyHex = '133457799BBCDFF1';   // 8-byte key (hex)
  const plainHex = '0123456789ABCDEF'; // 8-byte block plaintext (hex)
  const N_ROUNDS = 16;                 // generate 16 round keys for tasks
  const TASK_I = 3;                    // "given i" examples (use i=3)
  const TASK_K = 5;                    // "given k" example (use k=5)
  const TASK_J = 2;                    // "given j" example (use j=2)
  // =================================

  console.log('=== DES lab tasks 2.1..2.11 outputs ===');
  console.log(`Key (hex): ${keyHex}`);
  console.log(`Plain (hex): ${plainHex}`);
  console.log(`Using example indices: i=${TASK_I}, k=${TASK_K}, j=${TASK_J}\n`);

  // Prepare bits
  const keyBits = hexToBits(keyHex);
  const plainBits = hexToBits(plainHex);

  // Generate round keys (16)
  const { roundKeys, C0, D0 } = generateRoundKeys(keyBits, N_ROUNDS, false);

  // Prepare IP and split
  const ip = permute(plainBits, IP);
  const L0 = ip.slice(0,32), R0 = ip.slice(32,64);

  // ---------- Task 2.1 ----------
  console.log('--- Task 2.1: Given DES key (8 symbols) determine K+ (PC-1 result) ---');
  const Kplus = permute(keyBits, PC1); // 56 bits
  console.log('K+ (56 bits, hex nibble representation):', bitsToHex(Kplus));
  console.log('K+ (binary):', bitsToBin(Kplus), '\n');

  // ---------- Task 2.2 ----------
  console.log(`--- Task 2.2: Given K+, determine C${TASK_I} and D${TASK_I} (for i = ${TASK_I}) ---`);
  // Recompute C_i and D_i iteratively
  let C = C0.slice(), D = D0.slice();
  for (let r = 1; r <= TASK_I; r++) {
    C = leftRotate(C, SHIFTS[r-1]);
    D = leftRotate(D, SHIFTS[r-1]);
  }
  console.log(`C${TASK_I} (28 bits, hex):`, bitsToHex(C));
  console.log(`C${TASK_I} (bin):`, bitsToBin(C));
  console.log(`D${TASK_I} (28 bits, hex):`, bitsToHex(D));
  console.log(`D${TASK_I} (bin):`, bitsToBin(D), '\n');

  // ---------- Task 2.3 ----------
  console.log(`--- Task 2.3: Given K+, determine round key K${TASK_I} ---`);
  // Build C_i and D_i again to produce Ki
  C = C0.slice(); D = D0.slice();
  for (let r = 1; r <= TASK_I; r++) { C = leftRotate(C, SHIFTS[r-1]); D = leftRotate(D, SHIFTS[r-1]); }
  const Ki_bits = permute(C.concat(D), PC2); // 48 bits
  console.log(`K${TASK_I} (48 bits, hex):`, bitsToHex(Ki_bits));
  console.log(`K${TASK_I} (bin):`, bitsToBin(Ki_bits), '\n');

  // ---------- Task 2.4 ----------
  console.log('--- Task 2.4: Given message (8 chars), find L1 ---');
  console.log('After initial permutation (IP):');
  console.log('L0 (hex):', bitsToHex(L0), ' L0 (bin):', bitsToBin(L0));
  console.log('R0 (hex):', bitsToHex(R0), ' R0 (bin):', bitsToBin(R0));
  // Compute round 1 using K1:
  const K1 = roundKeys[0];
  const { permuted: f1 } = fFunction(R0, K1);
  const L1 = R0.slice(); // by Feistel L1 = R0
  const R1 = xorBits(L0, f1);
  console.log('L1 (after round 1) (hex):', bitsToHex(L1));
  console.log('L1 (bin):', bitsToBin(L1), '\n');

  // ---------- Task 2.5 ----------
  console.log('--- Task 2.5: Given K+, determine all 16 round keys K1..K16 ---');
  for (let r = 0; r < roundKeys.length; r++) {
    console.log(`K${r+1}: hex=${bitsToHex(roundKeys[r])}  bin=${bitsToBin(roundKeys[r])}`);
  }
  console.log('');

  // ---------- Task 2.6 ----------
  console.log(`--- Task 2.6: In round i we know Ki and R${TASK_I-1}. Compute B1..B8 ---`);
  // Need R_{i-1} for TASK_I. We'll compute rounds up to TASK_I-1 to get R_{i-1}.
  let curL = L0.slice(), curR = R0.slice();
  for (let r = 1; r <= (TASK_I-1); r++) {
    const { permuted } = fFunction(curR, roundKeys[r-1]);
    const newR = xorBits(curL, permuted);
    curL = curR;
    curR = newR;
  }
  const Ri_1 = curR.slice();
  console.log(`R${TASK_I-1} (hex):`, bitsToHex(Ri_1), ' (bin):', bitsToBin(Ri_1));
  const expanded = permute(Ri_1, E);
  console.log('E(Ri-1) (48 bits) hex:', bitsToHex(expanded), ' bin:', bitsToBin(expanded));
  const Ki_task = roundKeys[TASK_I-1];
  console.log(`K${TASK_I} (48) hex:`, bitsToHex(Ki_task), ' bin:', bitsToBin(Ki_task));
  const B48 = xorBits(expanded, Ki_task);
  console.log('Ki xor E(Ri-1) (48 bits) hex:', bitsToHex(B48), ' bin:', bitsToBin(B48));
  const Bs = split6(B48);
  for (let b = 0; b < Bs.length; b++) {
    console.log(`B${b+1} (6 bits): hex(6bit->nibble)=${bitsToHex(Bs[b])} bin=${bitsToBin(Bs[b])}`);
  }
  console.log('');

  // ---------- Task 2.7 ----------
  console.log('--- Task 2.7: Given B1..B8 find S1(B1)..S8(B8) ---');
  const sOutputs = [];
  for (let b = 0; b < Bs.length; b++) {
    const { val, bits } = sboxJ(b+1, Bs[b]);
    sOutputs.push({ val, bits });
    console.log(`S${b+1}(B${b+1}) = ${val} (4 bits) hex=${bitsToHex(bits)} bin=${bitsToBin(bits)}`);
  }
  console.log('');

  // ---------- Task 2.8 ----------
  console.log(`--- Task 2.8: Calculate R${TASK_K} if L${TASK_K-1} and result of S-boxes are known ---`);
  // We'll set k = TASK_K (example 5). Compute L_{k-1} first by running rounds up to k-1
  curL = L0.slice(); curR = R0.slice();
  for (let r = 1; r <= (TASK_K-1); r++) {
    const { permuted } = fFunction(curR, roundKeys[r-1]);
    const newR = xorBits(curL, permuted);
    curL = curR;
    curR = newR;
  }
  const L_k_1 = curL.slice();
  console.log(`L${TASK_K-1} (hex):`, bitsToHex(L_k_1), ' bin:', bitsToBin(L_k_1));
  // Suppose "result of S-boxes" is sOutputs from earlier (we'll use those; normally they'd be for their round)
  const sboxConcat = sOutputs.map(o => o.bits).flat(); // 32 bits
  const f_from_sboxes = permute(sboxConcat, P); // apply P to get f(R,K)
  const Rk = xorBits(L_k_1, f_from_sboxes);
  console.log(`Given S-box result (32 bits) hex: ${bitsToHex(sboxConcat)} bin: ${bitsToBin(sboxConcat)}`);
  console.log('After P permutation (f output) hex:', bitsToHex(f_from_sboxes), ' bin:', bitsToBin(f_from_sboxes));
  console.log(`R${TASK_K} = L${TASK_K-1} xor f  -> hex: ${bitsToHex(Rk)} bin: ${bitsToBin(Rk)}\n`);

  // ---------- Task 2.9 ----------
  console.log(`--- Task 2.9: Given Ki + E(Ri-1) (48 bits), determine S_j(B_j) for given j = ${TASK_J} ---`);
  // We have B48 from task 2.6 (for TASK_I). We'll compute S_j for TASK_J (1-based)
  const Bj = Bs[TASK_J-1];
  const Sj = sboxJ(TASK_J, Bj);
  console.log(`Given 48-bit value (hex): ${bitsToHex(B48)} bin:${bitsToBin(B48)}`);
  console.log(`Extracted B${TASK_J}: bin=${bitsToBin(Bj)} -> S${TASK_J}(B${TASK_J}) = ${Sj.val} hex=${bitsToHex(Sj.bits)} bin=${bitsToBin(Sj.bits)}\n`);

  // ---------- Task 2.10 ----------
  console.log('--- Task 2.10: Given S1..S8 outputs and known L_{i-1}, calculate Ri ---');
  // Using previous sOutputs and L_{TASK_I-1} from earlier:
  // compute L_{i-1} (we computed Ri_1 earlier and curL accordingly)
  // Recompute L_{TASK_I-1}
  curL = L0.slice(); curR = R0.slice();
  for (let r = 1; r <= (TASK_I-1); r++) {
    const { permuted } = fFunction(curR, roundKeys[r-1]);
    const newR = xorBits(curL, permuted);
    curL = curR;
    curR = newR;
  }
  const L_i_1 = curL.slice();
  const sboxBitsConcat = sOutputs.map(o => o.bits).flat();
  const f_from_sboxes2 = permute(sboxBitsConcat, P);
  const R_i = xorBits(L_i_1, f_from_sboxes2);
  console.log(`L${TASK_I-1} (hex):`, bitsToHex(L_i_1), ' bin:', bitsToBin(L_i_1));
  console.log('Concatenated S-box outputs (32 bits) hex:', bitsToHex(sboxBitsConcat), ' bin:', bitsToBin(sboxBitsConcat));
  console.log('After P (f):', bitsToHex(f_from_sboxes2), ' bin:', bitsToBin(f_from_sboxes2));
  console.log(`R${TASK_I} = L${TASK_I-1} xor f  -> hex: ${bitsToHex(R_i)} bin: ${bitsToBin(R_i)}\n`);

  // ---------- Task 2.11 ----------
  console.log('--- Task 2.11: Given L16 and R16 determine encrypted block (hex) ---');
  // Run full encryption (16 rounds) to get L16, R16 as in des algorithm (note: our desEncryptBlock returns L and R after last round)
  const { ciphertext, L: L16, R: R16 } = desEncryptBlock(plainBits, roundKeys, false);
  console.log('L16 (hex):', bitsToHex(L16), ' bin:', bitsToBin(L16));
  console.log('R16 (hex):', bitsToHex(R16), ' bin:', bitsToBin(R16));
  const preoutput = R16.concat(L16);
  const encryptedBlock = permute(preoutput, FP);
  console.log('Encrypted block (hex):', bitsToHex(encryptedBlock));
  console.log('Encrypted block (bin):', bitsToBin(encryptedBlock));
  console.log('\n=== End of tasks ===');
}

// Exporting isn't required but keep for modular use
module.exports = { hexToBits, bitsToHex, permute, generateRoundKeys, fFunction, desEncryptBlock };
