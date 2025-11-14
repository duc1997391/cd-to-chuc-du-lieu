import { createReadStream } from "fs";

/**
 * Đếm tần suất xuất hiện của từng byte trong file.
 * @param filePath Đường dẫn tới file cần nén.
 * @returns Promise trả về { freq, totalBytes } với freq độ dài 256.
 */
export async function countByteFrequency(
  filePath: string
): Promise<{ freq: Uint32Array; totalBytes: number }> {
  const freq = new Uint32Array(256);
  let totalBytes = 0;

  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);

    stream.on("data", (chunk: any) => {
      for (let i = 0; i < chunk.length; i++) {
        freq[chunk[i]]++;
      }
      totalBytes += chunk.length;
    });

    stream.on("end", () => resolve({ freq, totalBytes }));
    stream.on("error", (err: unknown) => reject(err));
  });
}


