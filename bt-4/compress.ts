import { countByteFrequency } from "./functions/countByteFrequency";
import { buildHuffmanTree } from "./functions/huffmanTree";
import { deriveHuffmanCodes } from "./functions/huffmanCodes";
import { buildCanonicalCodes } from "./functions/canonical";
import { encodePayload } from "./functions/encode";
import { buildHzipHeaderCanonical } from "./functions/buildHeader";
import * as fs from "fs";
import path from "path";

export async function compressFile(filePath: string) {
  const startTime = Date.now();
  
  // Lấy thông tin file gốc
  const originalStats = fs.statSync(filePath);
  const originalSize = originalStats.size;
  console.log(`📦 Đang nén file ${path.basename(filePath)} (${originalSize} bytes)...`);

  const { freq } = await countByteFrequency(filePath);
  const { root } = buildHuffmanTree(freq);
  const { lengths } = deriveHuffmanCodes(root);
  const canonicalCodes = buildCanonicalCodes(lengths);
  const { payload, padBits, outBytes } = await encodePayload(filePath, canonicalCodes);

  // Lấy extension của file gốc
  const originalExtension = path.extname(filePath);

  const header = buildHzipHeaderCanonical(lengths, outBytes, padBits, originalExtension);

  // Tạo tên file output
  const baseName = path.basename(filePath);
  const outputPath = path.join('output', baseName.replace(path.extname(filePath), "") + ".hzip");


  await fs.promises.writeFile(outputPath, Buffer.concat([header, payload]));

  // Thông tin kết quả
  const endTime = Date.now();
  const duration = endTime - startTime;
  const compressedStats = fs.statSync(outputPath);
  const compressedSize = compressedStats.size;
  const compressionRatio = ((compressedSize / originalSize) * 100).toFixed(2);

  console.log("✅ Nén file thành công");
  console.log(`📂 *** Lưu tại: ${outputPath} ***`);
  console.log(`📏 Kích thước nén: ${compressedSize} bytes`);
  console.log(`📊 Tỷ lệ nén: ${compressionRatio}%`);
  console.log(`⏱️  Thời gian: ${duration}ms`);
}
