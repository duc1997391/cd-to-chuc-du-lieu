// canonical.ts
import type { HuffmanCode } from "./huffmanCodes";

export interface CanonicalCode extends HuffmanCode {}
/**
 * Xây dựng mã Huffman canonical từ mảng độ dài mã.
 * @param lengths Uint8Array độ dài 256; 0 nghĩa là symbol không xuất hiện
 * @returns codes: mảng 256 phần tử, mỗi phần tử là {code, length} hoặc null
 */
export function buildCanonicalCodes(
  lengths: Uint8Array
): Array<CanonicalCode | null> {
  const ALPHABET = 256;

  // Tìm độ dài lớn nhất để giới hạn vòng lặp
  let maxLen = 0;
  for (let i = 0; i < ALPHABET; i++) {
    if (lengths[i] > maxLen) maxLen = lengths[i];
  }
  if (maxLen === 0) {
    // file rỗng: không có mã nào
    return new Array(ALPHABET).fill(null);
  }

  // 1) Đếm số mã ở từng độ dài
  const blCount = new Array<number>(maxLen + 1).fill(0);
  for (let i = 0; i < ALPHABET; i++) {
    const L = lengths[i];
    if (L > 0) blCount[L]++;
  }

  // 2) Tính mã bắt đầu (first code) cho từng độ dài theo chuẩn canonical
  const nextCode: bigint[] = new Array<bigint>(maxLen + 1).fill(0n);
  let code = 0n;
  for (let L = 1; L <= maxLen; L++) {
    code = (code + BigInt(blCount[L - 1] ?? 0)) << 1n;
    nextCode[L] = code;
  }

  // 3) Gán mã: duyệt theo (L tăng dần, symbol tăng dần)
  const codes: Array<HuffmanCode | null> = new Array(ALPHABET).fill(null);
  for (let L = 1; L <= maxLen; L++) {
    if (blCount[L] === 0) continue;
    for (let sym = 0; sym < ALPHABET; sym++) {
      if (lengths[sym] === L) {
        const c = nextCode[L];
        codes[sym] = { code: c, length: L };
        nextCode[L] = c + 1n; // chuẩn bị cho symbol cùng độ dài tiếp theo
      }
    }
  }

  return codes;
}

/**
 * Rebuild canonical codes từ bảng (symbol, codeLen) đã đọc trong header.
 * Trả về mảng 256 phần tử: với symbol có mặt thì là {code,length}, còn lại null.
 */
export function rebuildCanonicalFromTable(
  entries: Array<{ symbol: number; codeLen: number }>
): Array<CanonicalCode | null> {
  // Sắp theo (length tăng dần, rồi symbol tăng dần)
  entries = [...entries].sort((a, b) => {
    if (a.codeLen !== b.codeLen) return a.codeLen - b.codeLen;
    return a.symbol - b.symbol;
  });

  // Tìm maxLen và đếm blCount[L]
  let maxLen = 0;
  for (const e of entries) if (e.codeLen > maxLen) maxLen = e.codeLen;
  const blCount = new Array<number>(maxLen + 1).fill(0);
  for (const e of entries) blCount[e.codeLen]++;

  // Tính nextCode[L]
  const nextCode: bigint[] = new Array(maxLen + 1).fill(0n);
  let code = 0n;
  for (let L = 1; L <= maxLen; L++) {
    code = (code + BigInt(blCount[L - 1] ?? 0)) << 1n;
    nextCode[L] = code;
  }

  // Gán code theo canonical
  const codes: Array<CanonicalCode | null> = new Array(256).fill(null);
  for (const e of entries) {
    const c = nextCode[e.codeLen];
    codes[e.symbol] = { code: c, length: e.codeLen };
    nextCode[e.codeLen] = c + 1n;
  }
  return codes;
}

