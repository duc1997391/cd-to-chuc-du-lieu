// encode.ts
import * as fs from "node:fs";
import { BitWriter } from "./bitIO";
import type { HuffmanCode } from "./huffmanCodes";

/**
 * Đóng gói dữ liệu nén (payload) bằng mã Huffman canonical.
 * @param inputPath đường dẫn file gốc
 * @param codes mảng 256 phần tử; codes[b] = {code,length} nếu byte b xuất hiện, hoặc null nếu không
 * @returns { payload: Buffer; padBits: number; outBytes: bigint } 
 *          payload: dữ liệu nhị phân đã pack bit
 *          padBits: số bit đệm ở byte cuối (0..7)
 *          outBytes: tổng số byte gốc đã nén (để ghi vào header làm OriginalSize)
 */
export async function encodePayload(
  inputPath: string,
  codes: Array<HuffmanNodeCodeOrNull>
): Promise<{ payload: Buffer; padBits: number; outBytes: bigint }> {
  const writer = new BitWriter();
  let total: bigint = 0n;

  await new Promise<void>((resolve, reject) => {
    const stream = fs.createReadStream(inputPath);
    stream.on("data", (chunk) => {
      if (!Buffer.isBuffer(chunk)) {
        reject(new Error("Expected Buffer chunk but got string"));
        return;
      }
      for (let i = 0; i < chunk.length; i++) {
        const b = chunk[i]; // 0..255
        total += 1n;

        const c = codes[b];
        if (!c || c.length === 0) {
          reject(
            new Error(
              `Byte 0x${b.toString(16)} xuất hiện trong dữ liệu nhưng không có mã canonical (length=0)`
            )
          );
          return;
        }
        writer.writeBits(c.code, c.length);
      }
    });
    stream.on("end", () => resolve());
    stream.on("error", reject);
  });

  const { payload, padBits } = writer.finish();
  return { payload, padBits, outBytes: total };
}

// Re-export type alias để tiện dùng nơi khác
export type HuffmanNodeCodeOrNull = HuffmanCode | null;
