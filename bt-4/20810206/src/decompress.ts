import { parseHzipHeader } from "./functions/readHeader";
import { rebuildCanonicalFromTable } from "./functions/canonical";
import { decodePayloadToFile } from "./functions/decode";
import * as fs from "fs";
import path from "path";

export async function decompressFile(filePath: string) {
  const startTime = Date.now();

  // Lấy thông tin file nén
  const compressedStats = fs.statSync(filePath);
  const compressedSize = compressedStats.size;

  const { originalSize, originalExtension, entries, padBits, payload } = await parseHzipHeader(filePath);

  const canonicalCodes = rebuildCanonicalFromTable(entries);

  // Tạo tên file output ra thư mục output dựa trên extension gốc
  const baseName = path.basename(filePath, ".hzip");
  const outputPath = path.join("output", baseName + originalExtension);

  console.log(`📦 Đang giải nén file ${path.basename(filePath)} (${compressedSize} bytes)...`);

  await decodePayloadToFile(payload, padBits, canonicalCodes, originalSize, outputPath);

  // Thông tin kết quả
  const endTime = Date.now();
  const duration = endTime - startTime;
  const decompressedStats = fs.statSync(outputPath);
  const decompressedSize = decompressedStats.size;

  console.log("✅ Giải nén thành công");
  console.log(`📂 Lưu tại: ${outputPath}`);
  console.log(`📏 Kích thước file mới: ${decompressedSize} bytes`);
  console.log(`⏱️  Thời gian: ${duration}ms`);
}
