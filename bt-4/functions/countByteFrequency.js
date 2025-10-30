const fs = require("fs");

/**
 * Đếm tần suất xuất hiện của từng byte trong file.
 * @param {string} filePath - Đường dẫn tới file cần nén.
 * @returns {Promise<Uint32Array>} - Mảng tần suất độ dài 256.
 */
async function countByteFrequency(filePath) {
  const freq = new Uint32Array(256); // Mỗi phần tử = số lần xuất hiện byte đó.
  let totalBytes = 0;

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath);

    stream.on("data", chunk => {
      // chunk là Buffer: mỗi phần tử 0–255
      for (let i = 0; i < chunk.length; i++) {
        freq[chunk[i]]++;
      }
      totalBytes += chunk.length;
    });

    stream.on("end", () => resolve({ freq, totalBytes }));
    stream.on("error", err => reject(err));
  });
}

module.exports = { countByteFrequency };