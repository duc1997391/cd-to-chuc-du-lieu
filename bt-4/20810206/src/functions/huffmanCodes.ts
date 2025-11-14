import type { HuffmanNode } from "./huffmanTree";

/**
 * Interface cho mã Huffman
 */
export interface HuffmanCode {
  code: bigint;   // Mẫu bit nhị phân, lưu ở phần LSB, dài = length bit
  length: number; // Số bit hợp lệ trong 'code'
}

/**
 * Tạo bảng mã Huffman từ cây Huffman bằng cách duyệt DFS
 *
 * Quy tắc gán mã:
 * - Bắt đầu từ root với code=0, length=0
 * - Đi trái: thêm bit 0 (code << 1 | 0)
 * - Đi phải: thêm bit 1 (code << 1 | 1)
 * - Đến lá: gán code và length cho byte tương ứng
 *
 * @param root Gốc của cây Huffman
 * @returns Object chứa mảng lengths và codes cho 256 byte
 */
export function deriveHuffmanCodes(root: HuffmanNode | null): {
  lengths: Uint8Array;          // Mảng độ dài mã cho 256 byte
  codes: Array<HuffmanCode|null>; // Mảng mã Huffman cho 256 byte
} {
  const BYTE_RANGE = 256; // Số lượng byte có thể có (0-255)
  const lengths = new Uint8Array(BYTE_RANGE);
  const codes: Array<HuffmanCode | null> = new Array(BYTE_RANGE).fill(null);

  if (!root) {
    // Trường hợp file rỗng: không có symbol nào
    return { lengths, codes };
  }

  // Trường hợp đặc biệt: chỉ có 1 symbol (cây chỉ có 1 nút lá)
  if (root.symbol !== null) {
    lengths[root.symbol] = 1;
    codes[root.symbol] = { code: 0n, length: 1 };
    return { lengths, codes };
  }

  // Duyệt cây theo chiều sâu (DFS) không đệ quy để tránh stack overflow với cây sâu
  // Mỗi frame chứa: nút hiện tại, mã hiện tại, độ dài mã hiện tại
  type TraversalFrame = { node: HuffmanNode; code: bigint; length: number };
  const stack: TraversalFrame[] = [{ node: root, code: 0n, length: 0 }];

  while (stack.length > 0) {
    const currentFrame = stack.pop()!;
    const { node, code, length: currentLength } = currentFrame;

    if (node.symbol !== null) {
      // Đã đến nút lá: gán mã Huffman và độ dài cho byte tương ứng
      lengths[node.symbol] = currentLength;
      codes[node.symbol] = { code, length: currentLength };
      continue;
    }

    // Đẩy nút phải vào stack trước, nút trái sau để nút trái được xử lý trước
    // (vì stack là LIFO - Last In First Out)
    if (node.right) {
      // Đi phải: thêm bit 1 vào mã hiện tại
      stack.push({
        node: node.right,
        code: (code << 1n) | 1n,
        length: currentLength + 1
      });
    }
    if (node.left) {
      // Đi trái: thêm bit 0 vào mã hiện tại
      stack.push({
        node: node.left,
        code: (code << 1n) | 0n,
        length: currentLength + 1
      });
    }
  }

  return { lengths, codes };
}
