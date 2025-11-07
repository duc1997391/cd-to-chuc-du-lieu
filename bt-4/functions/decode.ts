// decode.ts
import * as fs from "node:fs/promises";
import { BitReader } from "./bitIO";
import type { CanonicalCode } from "./canonical";

// Nút cây giải mã
interface DecNode {
  left: DecNode | null;
  right: DecNode | null;
  symbol: number | null; // null = nút trong; 0..255 = lá
}

/** Tạo nút trống */
function makeNode(): DecNode {
  return { left: null, right: null, symbol: null };
}

/** Dựng cây nhị phân từ bảng canonical (trái=0, phải=1) */
export function buildDecodeTree(codes: Array<CanonicalCode | null>): DecNode | null {
  // Nếu không có symbol nào → file rỗng
  if (codes.every(c => c === null)) return null;

  const root = makeNode();

  // Trường hợp chỉ có 1 symbol: độ dài phải = 1 (theo chuẩn của ta)
  // nhưng kể cả length=1 hay các triển khai khác, ta vẫn gắn vào 1 cạnh bất kỳ.
  for (let sym = 0; sym < 256; sym++) {
    const c = codes[sym];
    if (!c) continue;

    // length > 0
    if (c.length <= 0) throw new Error(`Invalid code length for symbol ${sym}`);

    let node = root;
    for (let i = c.length - 1; i >= 0; i--) {
      const bit = Number((c.code >> BigInt(i)) & 1n);
      if (bit === 0) {
        if (!node.left) node.left = makeNode();
        node = node.left;
      } else {
        if (!node.right) node.right = makeNode();
        node = node.right;
      }
    }
    if (node.symbol !== null) {
      throw new Error("Invalid canonical set: code collision");
    }
    node.symbol = sym;
  }

  return root;
}

/**
 * Giải mã payload → ghi ra file gốc.
 * @param payload Buffer bitstream nén
 * @param padBits số bit đệm ở byte cuối (0..7)
 * @param codes bảng canonical 256 phần tử
 * @param originalSize tổng số byte gốc cần xuất (uint64 as bigint)
 * @param outPath đường dẫn file đích
 */
export async function decodePayloadToFile(
  payload: Buffer,
  padBits: number,
  codes: Array<CanonicalCode | null>,
  originalSize: bigint,
  outPath: string
): Promise<void> {
  // File rỗng
  if (originalSize === 0n) {
    await fs.writeFile(outPath, Buffer.alloc(0));
    return;
  }

  // Dựng cây giải mã
  const root = buildDecodeTree(codes);
  if (!root) throw new Error("Decode tree is empty while originalSize > 0");

  const br = new BitReader(payload, padBits);
  const outChunks: Buffer[] = [];
  let produced = 0n;

  let node: DecNode = root;

  while (produced < originalSize) {
    const bit = br.readBit();
    if (bit === null) {
      throw new Error("Unexpected end of payload (bitstream truncated)");
    }

    node = (bit === 0 ? node.left : node.right)!;
    if (!node) throw new Error("Invalid bitstream: hit null branch");

    if (node.symbol !== null) {
      // Xuất 1 byte
      outChunks.push(Buffer.from([node.symbol]));
      produced += 1n;
      node = root; // quay lại gốc
      // (tối ưu: flush theo block nếu muốn)
    }
  }

  // Ghi ra file
  await fs.writeFile(outPath, Buffer.concat(outChunks));
}
