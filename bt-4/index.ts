import { countByteFrequency } from "./functions/countByteFrequency";
import { buildHuffmanTree, printHuffmanTree } from "./functions/huffmanTree";
import { deriveHuffmanCodes } from "./functions/huffmanCodes";
import { buildCanonicalCodes, rebuildCanonicalFromTable } from "./functions/canonical";
import { encodePayload } from "./functions/encode";
import { buildHzipHeaderCanonical } from "./functions/buildHeader";
import { createWriteStream } from "node:fs";
import { parseHzipHeader } from "./functions/readHeader";
import { decodePayloadToFile } from "./functions/decode";

async function compressFile(filePath: string) {
  const { freq, totalBytes } = await countByteFrequency(filePath);
  console.log("Total bytes: ", totalBytes);
  const { root, symbolCount } = buildHuffmanTree(freq);
  console.log("Symbol count: ", symbolCount);
  if (root) {
    printHuffmanTree(root);
  }
  const { lengths, codes } = deriveHuffmanCodes(root);
  console.log("Lengths: ", lengths);
  codes.forEach((code, index) => {
    if (code) {
      console.log(`${index}: ${code.code} ${code.code.toString(2)}, ${code.length}`);
    }
  })

  const canonicalCodes = buildCanonicalCodes(lengths);
  canonicalCodes.forEach((code, index) => {
    if (code) {
      console.log(`${index}: ${code.code}, ${code.length}`);
    }
  })

  const { payload, padBits, outBytes } = await encodePayload(filePath, canonicalCodes);
  
  const header = buildHzipHeaderCanonical(lengths, outBytes, padBits);
  console.log("Header: ", header);

  // 7) Ghi file .hzip = header + payload (stream để tiết kiệm RAM với payload lớn)
  const outputPath = filePath.replace(".txt", ".hzip");
  await new Promise<void>((resolve, reject) => {
    const ws = createWriteStream(outputPath, { flags: "w" });
    ws.once("error", reject);
    ws.write(header, (e) => {
      if (e) return reject(e);
      // Ghi payload
      // const rs = createReadStream(null as any); // placeholder: chúng ta đã có payload trong RAM
      // Ở đây payload đang là Buffer -> viết trực tiếp
      ws.write(payload, (e2) => {
        if (e2) return reject(e2);
        ws.end(resolve);
      });
    });
  });

  console.log("File compressed successfully, output file: ", outputPath);
  console.log("Original size: ", totalBytes);
  console.log("Compressed size: ", payload.length);
  console.log("Compression ratio: ", ((payload.length / totalBytes) * 100).toFixed(2) + "%");
}

async function decompressFile(filePath: string) {
  const { magic, version, originalSize, entries, padBits, payload } = await parseHzipHeader(filePath);
  console.log("Magic: ", magic);
  console.log("Version: ", version);
  console.log("Original size: ", originalSize);
  console.log("Entries: ", entries);
  console.log("Pad bits: ", padBits);
  console.log("Payload: ", payload);
  const canonicalCodes = rebuildCanonicalFromTable(entries);
  await decodePayloadToFile(payload, padBits, canonicalCodes, originalSize, filePath.replace(".hzip", "(copy).txt"));
}

// compressFile("data.txt");
decompressFile("data.hzip");
