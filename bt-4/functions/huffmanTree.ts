// huffmanTree.ts
// Bước 2: Xây cây Huffman từ bảng tần suất (freq: BigUint64Array(256))
// Yêu cầu TS target >= ES2020 để dùng BigInt

export interface HuffmanNode {
  weight: bigint;                 // tổng tần suất (dùng bigint để tránh tràn)
  symbol: number | null;          // 0..255 nếu là lá, null nếu là nút trong
  left: HuffmanNode | null;
  right: HuffmanNode | null;
  minSymbol: number;              // ký tự nhỏ nhất trong nhánh (tie-break ổn định)
}

class MinHeap<T> {
  private a: T[] = [];
  constructor(private cmp: (x: T, y: T) => number) {}

  size(): number { return this.a.length; }

  push(x: T): void {
    this.a.push(x);
    this.siftUp(this.a.length - 1);
  }

  pop(): T | null {
    if (this.a.length === 0) return null;
    const top = this.a[0];
    const last = this.a.pop() as T;
    if (this.a.length > 0) {
      this.a[0] = last;
      this.siftDown(0);
    }
    return top;
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.cmp(this.a[i], this.a[p]) < 0) {
        [this.a[i], this.a[p]] = [this.a[p], this.a[i]];
        i = p;
      } else break;
    }
  }

  private siftDown(i: number): void {
    const n = this.a.length;
    while (true) {
      const l = i * 2 + 1;
      const r = l + 1;
      let m = i;
      if (l < n && this.cmp(this.a[l], this.a[m]) < 0) m = l;
      if (r < n && this.cmp(this.a[r], this.a[m]) < 0) m = r;
      if (m !== i) {
        [this.a[i], this.a[m]] = [this.a[m], this.a[i]];
        i = m;
      } else break;
    }
  }
}

function makeLeaf(symbol: number, weight: bigint): HuffmanNode {
  return {
    weight,
    symbol,            // lá
    left: null,
    right: null,
    minSymbol: symbol, // phục vụ tie-break
  };
}

function makeParent(left: HuffmanNode, right: HuffmanNode): HuffmanNode {
  return {
    weight: left.weight + right.weight,
    symbol: null,      // nút trong
    left,
    right,
    minSymbol: Math.min(left.minSymbol, right.minSymbol),
  };
}

/**
 * Xây cây Huffman từ tần suất byte.
 * @param freq BigUint64Array độ dài 256, freq[b] là số lần xuất hiện byte b
 * @returns { root, symbolCount }
 *  - root: gốc cây Huffman (null nếu file rỗng)
 *  - symbolCount: số symbol thực sự xuất hiện (>0)
 */
export function buildHuffmanTree(freq: Uint32Array): {
  root: HuffmanNode | null;
  symbolCount: number;
} {
  // Thu thập các lá có tần suất > 0
  const leaves: HuffmanNode[] = [];
  for (let b = 0; b < 256; b++) {
    if (freq[b] > 0) leaves.push(makeLeaf(b, BigInt(freq[b])));
  }
  const symbolCount = leaves.length;

  if (symbolCount === 0) {
    return { root: null, symbolCount: 0 }; // file rỗng
  }

  // Hàng đợi ưu tiên theo (weight, minSymbol) để ổn định khi bằng tần suất
  const heap = new MinHeap<HuffmanNode>((x, y) => {
    if (x.weight < y.weight) return -1;
    if (x.weight > y.weight) return 1;
    if (x.minSymbol < y.minSymbol) return -1;
    if (x.minSymbol > y.minSymbol) return 1;
    return 0;
  });

  for (const leaf of leaves) heap.push(leaf);

  // Nếu chỉ có 1 symbol: trả về trực tiếp; bước gán mã sẽ đặt độ dài = 1
  if (heap.size() === 1) {
    return { root: heap.pop(), symbolCount };
  }

  // Ghép dần 2 nút nhẹ nhất thành nút cha cho đến khi còn 1 nút
  while (heap.size() > 1) {
    const left = heap.pop()!;
    const right = heap.pop()!;
    heap.push(makeParent(left, right));
  }

  return { root: heap.pop(), symbolCount };
}

function printHuffmanTreeUtil(root: HuffmanNode, prefix = "", isLeft = true) {
  if (!root)
    return;

  console.log(`${prefix}${isLeft ? "├── " : "└── "}${root.symbol ?? '_'}:${root.weight}`);

  if (root.left || root.right) {
    if (root.left) {
      printHuffmanTreeUtil(root.left, prefix + (isLeft ? "│   " : "    "), true);
    } else if (root.right) {
      console.log(prefix + (isLeft ? "│   " : "    ") + "├── " + "null");
    }

    if (root.right) {
      printHuffmanTreeUtil(root.right, prefix + (isLeft ? "│   " : "    "), false);
    }
  }
}

export function printHuffmanTree(root: HuffmanNode) {
  if (!root) {
    console.log("Empty tree");
    return;
  }
  console.log(`${root.symbol ?? '_'}:${root.weight}`);
  if (root.left) {
    printHuffmanTreeUtil(root.left, "", true);
  } else if (root.right) {
    console.log("├── null");
  }
  if (root.right) {
    printHuffmanTreeUtil(root.right, "", false);
  }
  console.log("--------------------------------");
};