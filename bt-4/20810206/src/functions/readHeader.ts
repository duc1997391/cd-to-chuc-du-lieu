import fs from "fs/promises";
import type { HzipHeader } from "./buildHeader";

/**
 * Đọc giá trị 64-bit không dấu từ Buffer theo định dạng Little-Endian
 * @param buffer Buffer chứa dữ liệu
 * @param offset Vị trí bắt đầu đọc trong buffer
 * @returns Giá trị bigint được đọc
 */
function readUint64LE(buffer: Buffer, offset: number): bigint {
  let result = 0n;
  let bitShift = 0n;

  // Đọc từng byte và dịch bit (Little-Endian: byte thấp trước)
  for (let byteIndex = 0; byteIndex < 8; byteIndex++) {
    result |= BigInt(buffer[offset + byteIndex]) << bitShift;
    bitShift += 8n;
  }

  return result;
}

/**
 * Đọc giá trị 16-bit không dấu từ Buffer theo định dạng Little-Endian
 * @param buffer Buffer chứa dữ liệu
 * @param offset Vị trí bắt đầu đọc trong buffer
 * @returns Giá trị số được đọc
 */
function readUint16LE(buffer: Buffer, offset: number): number {
  // Byte thấp (LSB) + byte cao dịch trái 8 bit (MSB)
  return buffer[offset] | (buffer[offset + 1] << 8);
}

/**
 * Phân tích header của file HZIP và tách payload
 *
 * Đọc tuần tự các trường trong header theo format đã định nghĩa
 * và trả về cấu trúc HzipHeader chứa tất cả thông tin metadata
 *
 * @param filePath Đường dẫn đến file HZIP cần phân tích
 * @returns Promise chứa cấu trúc header đã được parse
 */
export async function parseHzipHeader(filePath: string): Promise<HzipHeader> {
  // Đọc toàn bộ file vào buffer
  const fileBuffer = await fs.readFile(filePath);
  let currentOffset = 0;

  // Bước 1: Đọc magic string (4 bytes)
  if (fileBuffer.length < 4) {
    throw new Error("File HZIP không hợp lệ: quá ngắn");
  }
  const magicString = fileBuffer.subarray(currentOffset, currentOffset + 4).toString("ascii");
  currentOffset += 4;
  if (magicString !== "HZIP") {
    throw new Error("File không phải định dạng HZIP");
  }

  // Bước 2: Đọc version (1 byte)
  if (fileBuffer.length < currentOffset + 1) {
    throw new Error("File HZIP bị cắt ngang tại phần version");
  }
  const formatVersion = fileBuffer[currentOffset++];
  if (formatVersion !== 0x01) {
    throw new Error(`Phiên bản HZIP không được hỗ trợ: ${formatVersion}`);
  }

  // Bước 3: Đọc kích thước file gốc (8 bytes, little-endian)
  if (fileBuffer.length < currentOffset + 8) {
    throw new Error("File HZIP bị cắt ngang tại phần kích thước gốc");
  }
  const originalFileSize = readUint64LE(fileBuffer, currentOffset);
  currentOffset += 8;

  // Bước 4: Đọc độ dài extension (1 byte)
  if (fileBuffer.length < currentOffset + 1) {
    throw new Error("File HZIP bị cắt ngang tại phần độ dài extension");
  }
  const extensionLength = fileBuffer[currentOffset++];

  // Bước 5: Đọc tên extension (extensionLength bytes)
  if (fileBuffer.length < currentOffset + extensionLength) {
    throw new Error("File HZIP bị cắt ngang tại phần extension");
  }
  const originalExtension = fileBuffer.subarray(currentOffset, currentOffset + extensionLength).toString("utf8");
  currentOffset += extensionLength;

  // Bước 6: Đọc số lượng symbol (2 bytes, little-endian)
  if (fileBuffer.length < currentOffset + 2) {
    throw new Error("File HZIP bị cắt ngang tại phần số lượng symbol");
  }
  const symbolCount = readUint16LE(fileBuffer, currentOffset);
  currentOffset += 2;
  if (symbolCount > 256) {
    throw new Error("File HZIP không hợp lệ: số lượng symbol > 256");
  }

  // Bước 7: Đọc bảng Huffman (symbol + codeLen cho mỗi symbol)
  const huffmanEntries: Array<{ symbol: number; codeLen: number }> = [];
  if (fileBuffer.length < currentOffset + symbolCount * 2) {
    throw new Error("File HZIP bị cắt ngang tại bảng Huffman");
  }
  for (let entryIndex = 0; entryIndex < symbolCount; entryIndex++) {
    const symbol = fileBuffer[currentOffset++];
    const codeLength = fileBuffer[currentOffset++];

    // Validate độ dài mã (phải > 0 và không quá 64 bit)
    if (codeLength <= 0 || codeLength > 64) {
      throw new Error(`Độ dài mã không hợp lệ ${codeLength} cho byte ${symbol}`);
    }

    huffmanEntries.push({ symbol, codeLen: codeLength });
  }

  // Bước 8: Đọc số bit padding (1 byte)
  if (fileBuffer.length < currentOffset + 1) {
    throw new Error("File HZIP thiếu thông tin padding bits");
  }
  const paddingBits = fileBuffer[currentOffset++];
  if (paddingBits < 0 || paddingBits > 7) {
    throw new Error(`Số bit padding không hợp lệ: ${paddingBits}`);
  }

  // Bước 9: Phần còn lại là payload (dữ liệu nén)
  const compressedPayload = fileBuffer.subarray(currentOffset);

  return {
    magic: magicString,
    version: formatVersion,
    originalSize: originalFileSize,
    originalExtension,
    entries: huffmanEntries,
    padBits: paddingBits,
    payload: compressedPayload
  };
}
