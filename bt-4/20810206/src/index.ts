import { compressFile } from "./compress";
import { decompressFile } from "./decompress";
import * as fs from "fs";
import * as readline from "readline";
import * as path from "path";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function showMenu() {
  console.log("\n=== Huffman File Compression Tool ===");
  console.log("1. Nén file");
  console.log("2. Giải nén file");
  console.log("3. Thoát chương trình");
  console.log("====================================");
}

async function handleCompress() {
  try {
    const filePath = await askQuestion("Nhập đường dẫn file cần nén: ");
    const normalizedPath = path.resolve(filePath);

    if (!(await checkFileExists(normalizedPath))) {
      console.log("❌ Lỗi: Không tìm thấy file '" + filePath + "'");
      return;
    }

    await compressFile(normalizedPath);
  } catch (error) {
    console.error("❌ Lỗi khi nén file:", error instanceof Error ? error.message : String(error));
  }
}

async function handleDecompress() {
  try {
    const filePath = await askQuestion("Nhập đường dẫn file cần giải nén: ");
    const normalizedPath = path.resolve(filePath);

    if (!(await checkFileExists(normalizedPath))) {
      console.log("❌ Lỗi: Không tìm thấy file '" + filePath + "'");
      return;
    }

    await decompressFile(normalizedPath);
  } catch (error) {
    console.error("❌ Lỗi khi giải nén file:", error instanceof Error ? error.message : String(error));
  }
}

async function main() {
  console.log("🎯 Chào mừng đến với Huffman File Compression Tool!");
  console.log("Công cụ nén/giải nén file sử dụng thuật toán Huffman");

  let running = true;

  while (running) {
    await showMenu();
    const choice = await askQuestion("Chọn chức năng (1-3): ");

    switch (choice.trim()) {
      case "1":
        await handleCompress();
        break;
      case "2":
        await handleDecompress();
        break;
      case "3":
        console.log("\n👋 Cảm ơn đã sử dụng Huffman File Compression Tool!");
        console.log("Chúc bạn một ngày tốt lành!");
        running = false;
        break;
      default:
        console.log("❌ Lựa chọn không hợp lệ. Vui lòng chọn 1, 2 hoặc 3.");
        break;
    }

    if (running) {
      console.log("\nNhấn Enter để tiếp tục...");
      await askQuestion("");
    }
  }

  rl.close();
}

// Chạy chương trình
main().catch((error) => {
  console.error("❌ Lỗi không mong muốn:", error);
  rl.close();
});
