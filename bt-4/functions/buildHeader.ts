// header.ts
import { Buffer } from "node:buffer";

export interface HzipHeader {
  magic: string;                // "HZIP"
  version: number;              // 0x01
  originalSize: bigint;         // uint64 LE
  entries: Array<{ symbol: number; codeLen: number }>; // length>0
  padBits: number;              // 0..7
  payload: Buffer;              // phần bitstream còn lại của file
}

/** Ghi số nguyên không dấu 64-bit (little-endian) vào Buffer 8B */
export function u64le(value: bigint): Buffer {
  const buf = Buffer.alloc(8);
  let v = value;
  for (let i = 0; i < 8; i++) {
    buf[i] = Number(v & 0xffn);
    v >>= 8n;
  }
  return buf;
}

/** Ghi số nguyên không dấu 16-bit (little-endian) vào Buffer 2B */
export function u16le(value: number): Buffer {
  const buf = Buffer.alloc(2);
  buf[0] = value & 0xff;
  buf[1] = (value >>> 8) & 0xff;
  return buf;
}

/**
 * Tạo header .hzip cho canonical Huffman.
 * @param lengths Uint8Array[256] độ dài mã (0 nếu không xuất hiện)
 * @param originalSize bigint (tổng byte gốc)
 * @param padBits số bit đệm ở byte cuối payload (0..7)
 * @returns Buffer header
 */
export function buildHzipHeaderCanonical(
  lengths: Uint8Array,
  originalSize: bigint,
  padBits: number
): Buffer {
  // Thu các symbol có mặt, theo ASCII tăng dần
  const present: number[] = [];
  for (let b = 0; b < 256; b++) if (lengths[b] > 0) present.push(b);

  const magic = Buffer.from("HZIP", "ascii");        // 4B
  const version = Buffer.from([0x01]);               // 1B
  const sizeBuf = u64le(originalSize);               // 8B
  const symCount = u16le(present.length);            // 2B
  const padBuf = Buffer.from([padBits & 0x07]);      // 1B

  // Bảng (symbol, codelen)
  const table = Buffer.alloc(present.length * 2);
  for (let i = 0; i < present.length; i++) {
    const sym = present[i];
    table[i * 2 + 0] = sym;          // symbol
    table[i * 2 + 1] = lengths[sym]; // code length
  }

  // header = magic + version + size + symCount + table + padBits
  return Buffer.concat([magic, version, sizeBuf, symCount, table, padBuf]);
}
