import { Buffer } from "node:buffer";

/**
 * Interface cho header của file HZIP
 * Header chứa tất cả metadata cần thiết để giải nén file
 */
export interface HzipHeader {
  magic: string;                // Chuỗi định danh "HZIP"
  version: number;              // Phiên bản format (hiện tại: 0x01)
  originalSize: bigint;         // Kích thước file gốc (64-bit little-endian)
  originalExtension: string;    // Extension của file gốc (vd: ".txt", ".pdf")
  entries: Array<{ symbol: number; codeLen: number }>; // Bảng độ dài mã Huffman
  padBits: number;              // Số bit padding ở cuối payload (0-7)
  payload: Buffer;              // Dữ liệu nén (bitstream)
}

/**
 * Ghi số nguyên 64-bit không dấu theo định dạng Little-Endian vào Buffer 8 byte
 * @param value Giá trị bigint cần ghi
 * @returns Buffer 8 byte chứa giá trị đã được encode
 */
export function writeUint64LE(value: bigint): Buffer {
  const buffer = Buffer.alloc(8);
  let remainingValue = value;

  // Ghi từng byte từ thấp đến cao (Little-Endian)
  for (let byteIndex = 0; byteIndex < 8; byteIndex++) {
    buffer[byteIndex] = Number(remainingValue & 0xffn);
    remainingValue >>= 8n;
  }

  return buffer;
}

/**
 * Ghi số nguyên 16-bit không dấu theo định dạng Little-Endian vào Buffer 2 byte
 * @param value Giá trị số cần ghi
 * @returns Buffer 2 byte chứa giá trị đã được encode
 */
export function writeUint16LE(value: number): Buffer {
  const buffer = Buffer.alloc(2);
  buffer[0] = value & 0xff;        // Byte thấp
  buffer[1] = (value >>> 8) & 0xff; // Byte cao
  return buffer;
}

/**
 * Tạo header cho file HZIP sử dụng mã Huffman canonical
 *
 * Cấu trúc header (theo thứ tự):
 * 1. Magic (4B): "HZIP"
 * 2. Version (1B): 0x01
 * 3. Original Size (8B): kích thước file gốc
 * 4. Extension Length (1B): độ dài extension
 * 5. Extension (N bytes): tên extension
 * 6. Symbol Count (2B): số lượng byte có mã Huffman
 * 7. Huffman Table (N*2 bytes): bảng (symbol, code_length)
 * 8. Pad Bits (1B): số bit padding
 *
 * @param lengths Mảng độ dài mã Huffman cho 256 byte
 * @param originalSize Kích thước file gốc
 * @param padBits Số bit padding ở cuối payload
 * @param originalExtension Extension của file gốc
 * @returns Buffer chứa header đã được tạo
 */
export function buildHzipHeaderCanonical(
  lengths: Uint8Array,
  originalSize: bigint,
  padBits: number,
  originalExtension: string
): Buffer {
  // Bước 1: Thu thập các byte có mã Huffman (độ dài > 0), sắp xếp theo thứ tự tăng dần
  const presentSymbols: number[] = [];
  for (let byteValue = 0; byteValue < 256; byteValue++) {
    if (lengths[byteValue] > 0) {
      presentSymbols.push(byteValue);
    }
  }

  // Bước 2: Tạo các thành phần header
  const magicBytes = Buffer.from("HZIP", "ascii");     // 4 bytes
  const versionByte = Buffer.from([0x01]);             // 1 byte
  const sizeBuffer = writeUint64LE(originalSize);      // 8 bytes
  const extensionBytes = Buffer.from(originalExtension, "utf8");
  const extensionLength = Buffer.from([extensionBytes.length & 0xff]); // 1 byte
  const symbolCount = writeUint16LE(presentSymbols.length); // 2 bytes
  const paddingBits = Buffer.from([padBits & 0x07]);   // 1 byte

  // Bước 3: Tạo bảng Huffman (symbol + code_length cho mỗi symbol)
  const huffmanTable = Buffer.alloc(presentSymbols.length * 2);
  for (let tableIndex = 0; tableIndex < presentSymbols.length; tableIndex++) {
    const symbol = presentSymbols[tableIndex];
    huffmanTable[tableIndex * 2 + 0] = symbol;           // Byte symbol
    huffmanTable[tableIndex * 2 + 1] = lengths[symbol];  // Độ dài mã
  }

  // Bước 4: Ghép tất cả thành header
  return Buffer.concat([
    magicBytes,       // "HZIP"
    versionByte,      // Version 1
    sizeBuffer,       // Kích thước gốc
    extensionLength,  // Độ dài extension
    extensionBytes,   // Tên extension
    symbolCount,      // Số symbol
    huffmanTable,     // Bảng Huffman
    paddingBits       // Số bit padding
  ]);
}
