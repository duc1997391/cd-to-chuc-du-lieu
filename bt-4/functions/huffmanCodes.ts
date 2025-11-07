// huffmanCodes.ts
// Bước 3: Tạo mã từ cây Huffman (trái = 0, phải = 1)
// Yêu cầu: dùng chung interface HuffmanNode của bước 2

import type { HuffmanNode } from "./huffmanTree";

export interface HuffmanCode {
  code: bigint;   // bit pattern, lưu ở phần LSB, dài = length bit
  length: number; // số bit hợp lệ trong 'code'
}

/**
 * Duyệt cây Huffman để sinh:
 *  - lengths[0..255]: độ dài mã của từng byte (0 nếu byte không xuất hiện)
 *  - codes[0..255]:   mã nhị phân thô (BigInt) và độ dài tương ứng
 *
 * Quy tắc gán mã thô:
 *   - bắt đầu từ root với (code=0n, len=0)
 *   - đi trái:  code = (code << 1n) | 0n
 *   - đi phải:  code = (code << 1n) | 1n
 *   - tới lá:   gán {code, length} cho symbol của lá
 *
 * Trường hợp đặc biệt:
 *   - Nếu cây chỉ có 1 lá: đặt length=1, code=0n (một bit 0 cho tất cả các byte)
 */
export function deriveHuffmanCodes(root: HuffmanNode | null): {
  lengths: Uint8Array;          // size 256
  codes: Array<HuffmanCode|null>; // size 256
} {
  const ALPHABET = 256;
  const lengths = new Uint8Array(ALPHABET);
  const codes: Array<HuffmanCode | null> = new Array(ALPHABET).fill(null);

  if (!root) {
    // File rỗng: không có symbol nào
    return { lengths, codes };
  }

  // Trường hợp chỉ có 1 symbol (root là lá)
  if (root.symbol !== null) {
    lengths[root.symbol] = 1;
    codes[root.symbol] = { code: 0n, length: 1 };
    return { lengths, codes };
  }

  // Duyệt DFS không đệ quy để an toàn với cây sâu
  type Frame = { node: HuffmanNode; code: bigint; len: number };
  const stack: Frame[] = [{ node: root, code: 0n, len: 0 }];

  while (stack.length) {
    const { node, code, len } = stack.pop()!;

    if (node.symbol !== null) {
      // Nút lá: gán mã & độ dài
      lengths[node.symbol] = len;
      codes[node.symbol] = { code, length: len };
      continue;
    }

    // Duyệt phải sau cùng để trái (0) được xử lý trước nếu muốn giữ thứ tự trực quan
    if (node.right) {
      // đi phải => thêm bit 1
      stack.push({ node: node.right, code: (code << 1n) | 1n, len: len + 1 });
    }
    if (node.left) {
      // đi trái => thêm bit 0
      stack.push({ node: node.left,  code: (code << 1n) | 0n, len: len + 1 });
    }
  }

  return { lengths, codes };
}
