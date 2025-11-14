import * as fs from "node:fs";
import { BitWriter } from "./bitIO";
import type { HuffmanCode } from "./huffmanCodes";

/**
 * Mã hóa file thành payload nén sử dụng mã Huffman canonical
 *
 * Quá trình:
 * 1. Đọc file theo stream để xử lý file lớn
 * 2. Với mỗi byte, tra cứu mã Huffman tương ứng
 * 3. Ghi mã Huffman vào bit stream
 * 4. Trả về payload đã nén và thông tin padding
 *
 * @param inputPath Đường dẫn file cần nén
 * @param codes Mảng 256 mã Huffman canonical (null nếu byte không xuất hiện)
 * @returns Object chứa payload nén, số bit padding, và tổng số byte gốc
 */
export async function encodePayload(
  inputPath: string,
  codes: Array<HuffmanCode | null>
): Promise<{ payload: Buffer; padBits: number; outBytes: bigint }> {
  const bitWriter = new BitWriter();
  let totalBytesProcessed = 0n;

  // Xử lý file theo stream để tiết kiệm bộ nhớ với file lớn
  await new Promise<void>((resolve, reject) => {
    const fileStream = fs.createReadStream(inputPath);

    fileStream.on("data", (dataChunk) => {
      // Kiểm tra kiểu dữ liệu chunk
      if (!Buffer.isBuffer(dataChunk)) {
        reject(new Error("Dữ liệu chunk phải là Buffer"));
        return;
      }

      // Xử lý từng byte trong chunk
      for (let byteIndex = 0; byteIndex < dataChunk.length; byteIndex++) {
        const byteValue = dataChunk[byteIndex]; // Giá trị byte 0-255
        totalBytesProcessed += 1n;

        // Tra cứu mã Huffman cho byte này
        const huffmanCode = codes[byteValue];
        if (!huffmanCode || huffmanCode.length === 0) {
          reject(
            new Error(
              `Byte 0x${byteValue.toString(16)} không có mã Huffman canonical`
            )
          );
          return;
        }

        // Ghi mã Huffman vào bit stream
        bitWriter.writeBits(huffmanCode.code, huffmanCode.length);
      }
    });

    fileStream.on("end", () => resolve());
    fileStream.on("error", reject);
  });

  // Hoàn thành việc ghi bit và lấy kết quả
  const { payload, padBits } = bitWriter.finish();
  return {
    payload,
    padBits,
    outBytes: totalBytesProcessed
  };
}

/**
 * Type alias cho mã Huffman hoặc null
 */
export type HuffmanCodeOrNull = HuffmanCode | null;
