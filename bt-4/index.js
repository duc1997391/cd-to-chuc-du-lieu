const { countByteFrequency } = require("./functions/countByteFrequency");

async function compressFile(filePath) {
  const { freq, totalBytes } = await countByteFrequency(filePath);
  console.log(freq, totalBytes);
}

compressFile("data.txt");