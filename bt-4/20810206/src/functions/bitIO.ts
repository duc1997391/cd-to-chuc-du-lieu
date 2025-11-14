import * as fs from "node:fs";

/**
 * Class ghi bit theo định dạng MSB-first (Most Significant Bit first)
 *
 * Thuật toán: Mỗi byte được xây dựng từ bit cao nhất (MSB) đến bit thấp nhất (LSB).
 * Khi đủ 8 bit, byte được ghi vào output buffer.
 */
export class BitWriter {
  private currentByte = 0;        // Byte đang được xây dựng (8 bit)
  private bitsWritten = 0;        // Số bit đã ghi vào currentByte (0-7)
  private outputBytes: number[] = []; // Mảng các byte đã hoàn thành

  /**
   * Ghi 1 bit (0 hoặc 1) vào byte hiện tại
   * @param bit Giá trị bit cần ghi (0 hoặc 1)
   */
  writeBit(bit: 0 | 1): void {
    // Dịch byte sang trái và thêm bit mới vào vị trí LSB
    // MSB-first: bit mới được thêm vào cuối (sẽ trở thành LSB)
    this.currentByte = ((this.currentByte << 1) | (bit & 1)) & 0xff;
    this.bitsWritten++;

    // Khi đã ghi đủ 8 bit, lưu byte vào output và reset
    if (this.bitsWritten === 8) {
      this.outputBytes.push(this.currentByte);
      this.currentByte = 0;
      this.bitsWritten = 0;
    }
  }

  /**
   * Ghi n bit từ BigInt theo thứ tự MSB→LSB
   * @param code Mẫu bit cần ghi (lưu ở phần LSB của BigInt)
   * @param length Số bit hợp lệ trong code
   */
  writeBits(code: bigint, length: number): void {
    // Duyệt từ bit cao nhất xuống bit thấp nhất
    for (let bitPosition = length - 1; bitPosition >= 0; bitPosition--) {
      const bit = Number((code >> BigInt(bitPosition)) & 1n) as 0 | 1;
      this.writeBit(bit);
    }
  }

  /**
   * Hoàn thành việc ghi bit và trả về kết quả
   * Nếu còn bit dở dang, đệm bằng bit 0 để đủ 8 bit
   * @returns Object chứa payload, số bit padding và số byte
   */
  finish(): { payload: Buffer; padBits: number; numBytes: number } {
    let paddingBits = 0;

    if (this.bitsWritten > 0) {
      // Tính số bit cần đệm để đủ 8 bit
      paddingBits = 8 - this.bitsWritten;

      // Dịch byte sang trái để đệm bit 0 vào cuối
      this.currentByte = (this.currentByte << paddingBits) & 0xff;
      this.outputBytes.push(this.currentByte);

      // Reset trạng thái
      this.currentByte = 0;
      this.bitsWritten = 0;
    }

    return {
      payload: Buffer.from(this.outputBytes),
      numBytes: this.outputBytes.length,
      padBits: paddingBits
    };
  }
}

/**
 * Class đọc bit theo định dạng MSB-first (Most Significant Bit first)
 *
 * Thuật toán: Đọc từng bit từ byte đầu tiên đến byte cuối cùng,
 * từ bit cao nhất (MSB) đến bit thấp nhất (LSB) của mỗi byte.
 * Xử lý padding bits ở cuối byte cuối cùng.
 */
export class BitReader {
  private currentByteIndex = 0;     // Index của byte hiện tại trong payload
  private currentBitMask = 0x80;    // Mặt nạ bit (bắt đầu từ MSB 0x80 = 10000000)
  private lastByteIndex: number;     // Index của byte cuối cùng
  private paddingBits: number;       // Số bit padding ở byte cuối

  /**
   * @param payload Buffer chứa dữ liệu đã được pack bit theo MSB-first
   * @param padBits Số bit padding ở cuối byte cuối (0-7)
   */
  constructor(private payload: Buffer, padBits: number) {
    this.lastByteIndex = Math.max(0, payload.length - 1);
    this.paddingBits = padBits;
  }

  /**
   * Đọc 1 bit từ payload theo thứ tự MSB-first
   * @returns 0 hoặc 1 nếu còn bit hợp lệ, null nếu hết dữ liệu
   */
  readBit(): 0 | 1 | null {
    // Trường hợp payload rỗng
    if (this.payload.length === 0) return null;

    // Kiểm tra xem có đang đọc vào vùng padding không (trước khi đọc bit)
    if (this.currentByteIndex === this.lastByteIndex &&
        this.currentBitMask < (0x80 >> (7 - this.paddingBits))) {
      // Đang ở vùng padding của byte cuối, không đọc nữa
      return null;
    }

    // Lấy bit tại vị trí hiện tại bằng mặt nạ
    const bit = (this.payload[this.currentByteIndex] & this.currentBitMask) ? 1 : 0;

    // Dịch mặt nạ sang bit tiếp theo (LSB)
    this.currentBitMask >>= 1;

    // Khi đã đọc hết 8 bit của byte hiện tại
    if (this.currentBitMask === 0) {
      if (this.currentByteIndex === this.lastByteIndex) {
        // Đã đến byte cuối cùng
        // Với padding bits, không còn bit nào hợp lệ để đọc nữa
        return bit as 0 | 1; // Trả về bit cuối cùng đã đọc
      } else {
        // Chuyển sang byte tiếp theo
        this.currentByteIndex++;
        if (this.currentByteIndex > this.lastByteIndex) {
          return null; // Đã vượt quá giới hạn
        }
        this.currentBitMask = 0x80; // Reset mặt nạ cho byte mới
      }
    }

    return bit as 0 | 1;
  }

  /**
   * Đọc tối đa n bit và trả về dưới dạng BigInt
   * Đọc theo thứ tự MSB-first, tích lũy vào accumulator
   * @param n Số bit cần đọc
   * @returns BigInt nếu đọc đủ n bit, null nếu hết dữ liệu giữa chừng
   */
  readBits(n: number): bigint | null {
    let accumulator = 0n;

    // Đọc từng bit và tích lũy vào accumulator
    for (let bitIndex = 0; bitIndex < n; bitIndex++) {
      const bit = this.readBit();
      if (bit === null) return null; // Hết dữ liệu giữa chừng

      // Dịch accumulator sang trái và thêm bit mới
      accumulator = (accumulator << 1n) | BigInt(bit);
    }

    return accumulator;
  }
}
