# Huffman File Compression Tool

Công cụ nén/giải nén file sử dụng thuật toán Huffman với mã canonical.

## 🚀 Tính năng

- **Nén file**: Nén bất kỳ file nào xuống kích thước nhỏ hơn
- **Giải nén file**: Khôi phục file gốc chính xác 100%
- **Tự động nhận diện extension**: Lưu và khôi phục extension file gốc
- **Hiệu suất cao**: Sử dụng Huffman canonical codes
- **Hỗ trợ nhiều loại file**: Text, SVG, JSON, binary files...

## 📦 Cài đặt

```bash
npm install
```

## 🖥️ Sử dụng

### Chạy chương trình console (Interactive Menu)
```bash
yarn start
```

Menu sẽ hiển thị 3 lựa chọn:
1. **Nén file** - Nhập đường dẫn file cần nén
2. **Giải nén file** - Nhập đường dẫn file .hzip cần giải nén
3. **Thoát chương trình**

### Chạy test demo
```bash
npx ts-node test_demo.ts
```

## 🔧 Cấu trúc dự án

```
bt-4/
├── index.ts           # Chương trình console chính
├── compress.ts        # Hàm nén file
├── decompress.ts      # Hàm giải nén file
├── test_demo.ts       # Script test tự động
├── functions/         # Các utility functions
│   ├── bitIO.ts       # Bit-level I/O operations
│   ├── huffmanTree.ts # Xây dựng cây Huffman
│   ├── huffmanCodes.ts# Tạo Huffman codes
│   ├── canonical.ts   # Canonical Huffman codes
│   ├── encode.ts      # Encoding logic
│   ├── decode.ts      # Decoding logic
│   ├── buildHeader.ts # Header format
│   └── readHeader.ts  # Header parsing
├── output/            # Thư mục chứa file nén/giải nén
└── cat.svg           # File SVG demo
```

## 📊 Hiệu suất

Test với các file khác nhau:

| File | Kích thước gốc | Kích thước nén | Tỷ lệ nén |
|------|----------------|----------------|------------|
| cat.svg | 3,407 bytes | 2,285 bytes | 67.07% |
| data.txt | 12,274 bytes | 6,797 bytes | 55.38% |
| test4.json | 28,718 bytes | 18,561 bytes | 64.63% |

## 🎯 Thuật toán

1. **Phân tích tần suất**: Đếm số lần xuất hiện của mỗi byte
2. **Xây dựng cây Huffman**: Tạo cây nhị phân tối ưu
3. **Tạo mã canonical**: Chuẩn hóa Huffman codes
4. **Nén bit-level**: Ghi codes vào bit stream
5. **Lưu header**: Chứa metadata và extension gốc
6. **Giải nén**: Đọc header và khôi phục file gốc

## 🔍 Format file .hzip

```
HZIP Header v1:
├── Magic: "HZIP" (4 bytes)
├── Version: 1 (1 byte)
├── Original Size: uint64 (8 bytes)
├── Extension Length: uint8 (1 byte)
├── Extension: UTF-8 bytes (N bytes)
├── Symbol Count: uint16 (2 bytes)
├── Huffman Table: (symbol, length) pairs
├── Pad Bits: 0-7 (1 byte)
└── Compressed Payload: bit stream
```

## 🧪 Test

Chạy test với file SVG, Text và JSON:
```bash
npx ts-node test_demo.ts
```

Tất cả test đều pass với độ chính xác 100%.

## 📝 License

MIT License

## 👨‍💻 Tác giả

Được phát triển như một phần của bài tập tổ chức dữ liệu.
