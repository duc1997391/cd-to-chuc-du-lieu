import * as fs from "node:fs/promises";
import { BitReader } from "./bitIO";
import type { CanonicalCode } from "./canonical";

/**
 * Nút trong cây Huffman dùng để giải mã
 * Cây này được xây dựng từ bảng mã canonical để tra cứu ngược
 */
interface DecodeNode {
  left: DecodeNode | null;   // Nhánh trái (bit 0)
  right: DecodeNode | null;  // Nhánh phải (bit 1)
  symbol: number | null;     // Byte 0-255 nếu là lá, null nếu là nút trong
}

/**
 * Tạo một nút trống trong cây giải mã
 */
function createEmptyNode(): DecodeNode {
  return { left: null, right: null, symbol: null };
}

/**
 * Xây dựng cây Huffman để giải mã từ bảng mã canonical
 *
 * Thuật toán: Duyệt qua từng mã canonical và xây dựng đường dẫn
 * từ gốc đến lá tương ứng, tạo các nút trung gian nếu cần.
 *
 * @param codes Mảng 256 mã canonical Huffman
 * @returns Gốc của cây giải mã hoặc null nếu không có mã nào
 */
export function buildDecodeTree(codes: Array<CanonicalCode | null>): DecodeNode | null {
  // Trường hợp đặc biệt: không có mã nào (file rỗng)
  if (codes.every(code => code === null)) return null;

  const root = createEmptyNode();

  // Duyệt qua tất cả 256 byte có thể có
  for (let byteValue = 0; byteValue < 256; byteValue++) {
    const canonicalCode = codes[byteValue];
    if (!canonicalCode) continue;

    // Validate độ dài mã
    if (canonicalCode.length <= 0) {
      throw new Error(`Độ dài mã không hợp lệ cho byte ${byteValue}`);
    }

    // Duyệt từ bit cao nhất đến bit thấp nhất của mã
    let currentNode = root;
    for (let bitPosition = canonicalCode.length - 1; bitPosition >= 0; bitPosition--) {
      // Lấy bit tại vị trí hiện tại (từ MSB)
      const currentBit = Number((canonicalCode.code >> BigInt(bitPosition)) & 1n);

      // Di chuyển xuống nhánh tương ứng
      if (currentBit === 0) {
        // Bit 0: đi sang nhánh trái
        if (!currentNode.left) {
          currentNode.left = createEmptyNode();
        }
        currentNode = currentNode.left;
      } else {
        // Bit 1: đi sang nhánh phải
        if (!currentNode.right) {
          currentNode.right = createEmptyNode();
        }
        currentNode = currentNode.right;
      }
    }

    // Đã đến vị trí lá: kiểm tra xung đột và gán symbol
    if (currentNode.symbol !== null) {
      throw new Error("Mã canonical không hợp lệ: xung đột tại lá");
    }
    currentNode.symbol = byteValue;
  }

  return root;
}

/**
 * Giải mã payload nén thành file gốc
 *
 * Thuật toán:
 * 1. Xây dựng cây Huffman từ bảng mã canonical
 * 2. Đọc từng bit từ payload và duyệt cây để tìm symbol
 * 3. Khi đến lá, xuất byte tương ứng và quay lại gốc
 * 4. Lặp cho đến khi đủ số byte gốc cần thiết
 *
 * @param payload Buffer chứa bitstream nén
 * @param padBits Số bit padding ở byte cuối (0-7)
 * @param codes Mảng 256 mã canonical Huffman
 * @param originalSize Số byte gốc cần giải mã
 * @param outPath Đường dẫn file đầu ra
 */
export async function decodePayloadToFile(
  payload: Buffer,
  padBits: number,
  codes: Array<CanonicalCode | null>,
  originalSize: bigint,
  outPath: string
): Promise<void> {
  // Trường hợp đặc biệt: file rỗng
  if (originalSize === 0n) {
    await fs.writeFile(outPath, Buffer.alloc(0));
    return;
  }

  // Bước 1: Xây dựng cây giải mã từ bảng mã canonical
  const decodeTreeRoot = buildDecodeTree(codes);
  if (!decodeTreeRoot) {
    throw new Error("Cây giải mã rỗng nhưng kích thước file gốc > 0");
  }

  // Bước 2: Khởi tạo BitReader và các biến
  const bitReader = new BitReader(payload, padBits);
  const outputChunks: Buffer[] = [];
  let bytesDecoded = 0n;

  let currentNode: DecodeNode = decodeTreeRoot;

  // Bước 3: Giải mã từng byte
  while (bytesDecoded < originalSize) {
    // Đọc bit tiếp theo từ bitstream
    const nextBit = bitReader.readBit();
    if (nextBit === null) {
      throw new Error("Bitstream kết thúc sớm hơn mong đợi");
    }

    // Duyệt cây Huffman theo bit vừa đọc
    currentNode = (nextBit === 0 ? currentNode.left : currentNode.right)!;
    if (!currentNode) {
      throw new Error("Bitstream không hợp lệ: nhánh rỗng");
    }

    // Nếu đến lá của cây (tìm thấy symbol)
    if (currentNode.symbol !== null) {
      // Thêm byte đã giải mã vào output
      outputChunks.push(Buffer.from([currentNode.symbol]));
      bytesDecoded += 1n;

      // Quay trở lại gốc cây để giải mã byte tiếp theo
      currentNode = decodeTreeRoot;
    }
  }

  // Bước 4: Ghi toàn bộ dữ liệu đã giải mã ra file
  await fs.writeFile(outPath, Buffer.concat(outputChunks));
}
