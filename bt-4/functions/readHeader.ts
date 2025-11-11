// header.ts
import fs from "fs/promises";
import type { HzipHeader } from "./buildHeader";

/** Đọc uint64 little-endian → bigint */
function readU64LE(buf: Buffer, off: number): bigint {
  let v = 0n;
  let shift = 0n;
  for (let i = 0; i < 8; i++) {
    v |= BigInt(buf[off + i]) << shift;
    shift += 8n;
  }
  return v;
}

/** Đọc uint16 little-endian → number */
function readU16LE(buf: Buffer, off: number): number {
  return buf[off] | (buf[off + 1] << 8);
}

/** Parse file .hzip thành cấu trúc header + payload */
export async function parseHzipHeader(path: string): Promise<HzipHeader> {
  const file = await fs.readFile(path);
  let off = 0;

  // 1) Magic
  if (file.length < 4) throw new Error("Invalid HZIP: too short");
  const magic = file.subarray(off, off + 4).toString("ascii"); off += 4;
  if (magic !== "HZIP") throw new Error("Invalid HZIP: magic mismatch");

  // 2) Version
  if (file.length < off + 1) throw new Error("Invalid HZIP: truncated at version");
  const version = file[off++]; 
  if (version !== 0x01) throw new Error(`Unsupported HZIP version: ${version}`);

  // 3) OriginalSize (8B LE)
  if (file.length < off + 8) throw new Error("Invalid HZIP: truncated at originalSize");
  const originalSize = readU64LE(file, off); off += 8;

  // 4) Extension Length (1B)
  if (file.length < off + 1) throw new Error("Invalid HZIP: truncated at extension length");
  const extLen = file[off++];

  // 5) Extension Bytes (extLen bytes)
  if (file.length < off + extLen) throw new Error("Invalid HZIP: truncated at extension");
  const originalExtension = file.subarray(off, off + extLen).toString("utf8"); off += extLen;

  // 6) SymbolCount (2B LE)
  if (file.length < off + 2) throw new Error("Invalid HZIP: truncated at symbolCount");
  const symCount = readU16LE(file, off); off += 2;
  if (symCount > 256) throw new Error("Invalid HZIP: symbolCount > 256");

  // 7) Bảng (symbol:1B, codeLen:1B) lặp symCount
  const entries: Array<{ symbol: number; codeLen: number }> = [];
  if (file.length < off + symCount * 2) throw new Error("Invalid HZIP: truncated at table");
  for (let i = 0; i < symCount; i++) {
    const symbol = file[off++];
    const codeLen = file[off++];
    if (codeLen <= 0 || codeLen > 64) { // ngưỡng an toàn, tuỳ bạn chỉnh
      throw new Error(`Invalid codeLen ${codeLen} for symbol ${symbol}`);
    }
    entries.push({ symbol, codeLen });
  }

  // 8) PadBits (1B)
  if (file.length < off + 1) throw new Error("Invalid HZIP: missing padBits");
  const padBits = file[off++];
  if (padBits < 0 || padBits > 7) throw new Error(`Invalid padBits=${padBits}`);

  // 9) Payload
  const payload = file.subarray(off);

  return { magic, version, originalSize, originalExtension, entries, padBits, payload };
}
