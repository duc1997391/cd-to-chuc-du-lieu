import type { HuffmanCode } from "./huffmanCodes";

/**
 * Interface cho mã Huffman canonical (giống HuffmanCode)
 */
export interface CanonicalCode extends HuffmanCode {}

/**
 * Xây dựng mã Huffman canonical từ mảng độ dài mã
 *
 * Thuật toán canonical Huffman giúp giảm kích thước header bằng cách:
 * - Sắp xếp mã theo độ dài tăng dần
 * - Trong cùng độ dài, sắp xếp theo giá trị symbol tăng dần
 * - Gán mã từ nhỏ đến lớn cho mỗi nhóm
 *
 * @param lengths Mảng độ dài mã cho 256 byte (0 = byte không xuất hiện)
 * @returns Mảng 256 phần tử chứa mã canonical hoặc null
 */
export function buildCanonicalCodes(
  lengths: Uint8Array
): Array<CanonicalCode | null> {
  const BYTE_RANGE = 256; // Phạm vi byte (0-255)

  // Tìm độ dài mã lớn nhất trong tất cả các byte
  let maxCodeLength = 0;
  for (let byteIndex = 0; byteIndex < BYTE_RANGE; byteIndex++) {
    if (lengths[byteIndex] > maxCodeLength) {
      maxCodeLength = lengths[byteIndex];
    }
  }

  // Trường hợp đặc biệt: file rỗng hoặc không có byte nào
  if (maxCodeLength === 0) {
    return new Array(BYTE_RANGE).fill(null);
  }

  // Bước 1: Đếm số lượng mã Huffman ở mỗi độ dài
  // codeCountPerLength[length] = số byte có độ dài mã = length
  const codeCountPerLength = new Array<number>(maxCodeLength + 1).fill(0);
  for (let byteIndex = 0; byteIndex < BYTE_RANGE; byteIndex++) {
    const codeLength = lengths[byteIndex];
    if (codeLength > 0) {
      codeCountPerLength[codeLength]++;
    }
  }

  // Bước 2: Tính mã bắt đầu cho mỗi độ dài theo chuẩn canonical Huffman
  // nextCode[length] = mã đầu tiên cho độ dài 'length'
  const nextCode: bigint[] = new Array<bigint>(maxCodeLength + 1).fill(0n);
  let currentCode = 0n;
  for (let codeLength = 1; codeLength <= maxCodeLength; codeLength++) {
    // Dịch trái 1 bit và cộng số mã của độ dài trước đó
    currentCode = (currentCode + BigInt(codeCountPerLength[codeLength - 1] ?? 0)) << 1n;
    nextCode[codeLength] = currentCode;
  }

  // Bước 3: Gán mã canonical cho từng byte theo thứ tự:
  // - Độ dài tăng dần
  // - Trong cùng độ dài, theo giá trị byte tăng dần
  const canonicalCodes: Array<HuffmanCode | null> = new Array(BYTE_RANGE).fill(null);
  for (let codeLength = 1; codeLength <= maxCodeLength; codeLength++) {
    // Bỏ qua nếu không có mã nào ở độ dài này
    if (codeCountPerLength[codeLength] === 0) continue;

    // Gán mã cho tất cả byte có độ dài này
    for (let byteValue = 0; byteValue < BYTE_RANGE; byteValue++) {
      if (lengths[byteValue] === codeLength) {
        const assignedCode = nextCode[codeLength];
        canonicalCodes[byteValue] = { code: assignedCode, length: codeLength };
        nextCode[codeLength] = assignedCode + 1n; // Tăng mã cho byte tiếp theo
      }
    }
  }

  return canonicalCodes;
}

/**
 * Tái tạo bảng mã canonical Huffman từ thông tin trong header file nén
 *
 * Header chứa bảng (symbol, codeLen) đã được rút gọn. Hàm này:
 * - Sắp xếp lại theo thứ tự canonical (độ dài tăng dần, sau đó symbol tăng dần)
 * - Tính toán lại các mã canonical từ độ dài
 *
 * @param entries Mảng các entry {symbol, codeLen} từ header
 * @returns Mảng 256 phần tử chứa mã canonical hoặc null
 */
export function rebuildCanonicalFromTable(
  entries: Array<{ symbol: number; codeLen: number }>
): Array<CanonicalCode | null> {
  // Bước 1: Sắp xếp entries theo thứ tự canonical
  // - Độ dài mã tăng dần
  // - Trong cùng độ dài, symbol tăng dần
  const sortedEntries = [...entries].sort((entryA, entryB) => {
    if (entryA.codeLen !== entryB.codeLen) {
      return entryA.codeLen - entryB.codeLen; // Độ dài tăng dần
    }
    return entryA.symbol - entryB.symbol; // Symbol tăng dần
  });

  // Bước 2: Tìm độ dài mã lớn nhất
  let maxCodeLength = 0;
  for (const entry of sortedEntries) {
    if (entry.codeLen > maxCodeLength) {
      maxCodeLength = entry.codeLen;
    }
  }

  // Bước 3: Đếm số mã ở mỗi độ dài
  const codeCountPerLength = new Array<number>(maxCodeLength + 1).fill(0);
  for (const entry of sortedEntries) {
    codeCountPerLength[entry.codeLen]++;
  }

  // Bước 4: Tính mã bắt đầu cho mỗi độ dài
  const nextCodeStart: bigint[] = new Array<bigint>(maxCodeLength + 1).fill(0n);
  let currentCodeValue = 0n;
  for (let codeLength = 1; codeLength <= maxCodeLength; codeLength++) {
    currentCodeValue = (currentCodeValue + BigInt(codeCountPerLength[codeLength - 1] ?? 0)) << 1n;
    nextCodeStart[codeLength] = currentCodeValue;
  }

  // Bước 5: Gán mã canonical cho từng symbol
  const BYTE_RANGE = 256;
  const canonicalCodes: Array<CanonicalCode | null> = new Array(BYTE_RANGE).fill(null);
  for (const entry of sortedEntries) {
    const assignedCode = nextCodeStart[entry.codeLen];
    canonicalCodes[entry.symbol] = { code: assignedCode, length: entry.codeLen };
    nextCodeStart[entry.codeLen] = assignedCode + 1n;
  }

  return canonicalCodes;
}

