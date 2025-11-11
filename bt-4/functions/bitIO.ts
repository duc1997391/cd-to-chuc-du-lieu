// bitIO.ts
// Ghi/đọc bit ở dạng pack vào Buffer (MSB-first), hỗ trợ BigInt.

import * as fs from "node:fs";

export class BitWriter {
  private byte = 0;       // byte đang xây (8 bit)
  private filled = 0;     // đã lấp mấy bit (0..7)
  private out: number[] = [];

  /** Ghi 1 bit (0 hoặc 1). Bit được đẩy từ MSB → LSB. */
  writeBit(bit: 0 | 1): void {
    // nhét bit vào phía phải của byte đang xây (MSB-first)
    this.byte = ((this.byte << 1) | (bit & 1)) & 0xff;
    this.filled++;
    if (this.filled === 8) {
      this.out.push(this.byte);
      this.byte = 0;
      this.filled = 0;
    }
  }

  /**
   * Ghi n bit thấp của `code` (BigInt) theo thứ tự MSB→LSB.
   * @param code  bit pattern (nằm ở LSB)
   * @param length số bit hợp lệ trong `code`
   */
  writeBits(code: bigint, length: number): void {
    for (let i = length - 1; i >= 0; i--) {
      const b = Number((code >> BigInt(i)) & 1n) as 0 | 1;
      this.writeBit(b);
    }
  }

  /** Flush phần byte dở (nếu có), trả về payload và số bit đệm (0..7). */
  finish(): { payload: Buffer; padBits: number, numBytes: number } {
    let padBits = 0;
    if (this.filled > 0) {
      // đệm 0 cho đủ 8 bit
      padBits = 8 - this.filled;
      this.byte = (this.byte << padBits) & 0xff;
      this.out.push(this.byte);
      this.byte = 0;
      this.filled = 0;
    }
    return { payload: Buffer.from(this.out), numBytes: this.out.length, padBits };
  }
}

export class BitReader {
  private i = 0;            // index byte hiện tại
  private bitMask = 0x80;   // mặt nạ bit (MSB-first)
  private lastIndex: number;
  private lastBytePad: number;

  /**
   * @param payload Buffer đã pack bit theo MSB-first (đúng như BitWriter)
   * @param padBits số bit đệm ở **cuối byte cuối** (0..7)
   */
  constructor(private payload: Buffer, padBits: number) {
    this.lastIndex = Math.max(0, payload.length - 1);
    this.lastBytePad = padBits;
  }

  /** Đọc 1 bit; trả về 0/1; nếu hết bit hữu dụng trả về null */
  readBit(): 0 | 1 | null {
    if (this.payload.length === 0) return null;

    // Nếu đang ở byte cuối và đã đọc hết (8 - padBits) bit hữu dụng → dừng
    const bitsLeftInThisByte = Math.clz32(this.bitMask) === 24
      ? 8 // initial state (0x80)
      : 8 - Math.clz32(this.bitMask) + 24; // not needed, kept for clarity


    // Lấy bit
    const bit = (this.payload[this.i] & this.bitMask) ? 1 : 0;

    // Dịch sang bit tiếp theo
    this.bitMask >>= 1;
    if (this.bitMask === 0) {
      if (this.i === this.lastIndex) {
        // Hết byte cuối → kiểm tra padBits
        if (this.lastBytePad > 0) {
          // Vừa lấy bit cuối hữu dụng xong
          if (bitsLeftInThisByte === 8 - this.lastBytePad) {
            return bit as 0 | 1;
          }
          if (bitsLeftInThisByte > 8 - this.lastBytePad) {
            // đang bước vào vùng đệm → không nên đọc nữa
            return null;
          }
        } else {
          // padBits = 0, toàn bộ byte đều hữu ích
          // Đã trả về bit cuối của byte cuối, bây giờ không còn bit nào nữa
          // Vẫn return bit hiện tại, BitReader sẽ return null ở lần gọi tiếp theo
        }
      } else {
        // sang byte kế
        this.i++;
        if (this.i > this.lastIndex) {
          console.log(`DEBUG BitReader: Exceeded lastIndex, returning null`);
          return null;
        }
        this.bitMask = 0x80;
      }
    }
    // Trường hợp vào vùng đệm ở byte cuối
    if (this.i === this.lastIndex && this.bitMask === (0x80 >> (8 - this.lastBytePad))) {
      // next read would be in padding; allow current bit, next call returns null
    }
    return bit as 0 | 1;
  }

  /** Đọc tối đa `n` bit (MSB→LSB) thành số BigInt; nếu hết giữa chừng trả về null */
  readBits(n: number): bigint | null {
    let acc = 0n;
    for (let i = 0; i < n; i++) {
      const b = this.readBit();
      if (b === null) return null;
      acc = (acc << 1n) | BigInt(b);
    }
    return acc;
  }
}
