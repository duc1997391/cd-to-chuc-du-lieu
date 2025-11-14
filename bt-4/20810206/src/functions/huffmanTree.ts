/**
 * Interface cho nút trong cây Huffman
 */
export interface HuffmanNode {
  weight: bigint;                 // Tổng tần suất xuất hiện (dùng BigInt để tránh tràn số)
  symbol: number | null;          // Byte 0-255 nếu là lá, null nếu là nút trong
  left: HuffmanNode | null;
  right: HuffmanNode | null;
  minSymbol: number;              // Byte nhỏ nhất trong nhánh con (để tie-break khi weight bằng nhau)
}

/**
 * Min-heap ưu tiên cho việc xây dựng cây Huffman
 * Sắp xếp theo weight, sau đó theo minSymbol để đảm bảo tính ổn định
 */
class MinHeap<T> {
  private heap: T[] = [];         // Mảng lưu trữ các phần tử trong heap
  constructor(private comparator: (x: T, y: T) => number) {}

  size(): number { return this.heap.length; }

  push(x: T): void {
    this.heap.push(x);
    this.siftUp(this.heap.length - 1);
  }

  pop(): T | null {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const last = this.heap.pop() as T;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return top;
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const parentIndex = (i - 1) >> 1;  // Lấy index của nút cha
      if (this.comparator(this.heap[i], this.heap[parentIndex]) < 0) {
        [this.heap[i], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[i]];
        i = parentIndex;
      } else break;
    }
  }

  private siftDown(i: number): void {
    const heapSize = this.heap.length;
    while (true) {
      const leftChild = i * 2 + 1;   // Index của con trái
      const rightChild = leftChild + 1; // Index của con phải
      let minIndex = i;             // Giả sử nút hiện tại là nhỏ nhất

      // So sánh với con trái
      if (leftChild < heapSize && this.comparator(this.heap[leftChild], this.heap[minIndex]) < 0) {
        minIndex = leftChild;
      }
      // So sánh với con phải
      if (rightChild < heapSize && this.comparator(this.heap[rightChild], this.heap[minIndex]) < 0) {
        minIndex = rightChild;
      }

      // Nếu tìm thấy nút nhỏ hơn, swap và tiếp tục sift down
      if (minIndex !== i) {
        [this.heap[i], this.heap[minIndex]] = [this.heap[minIndex], this.heap[i]];
        i = minIndex;
      } else break;
    }
  }
}

/**
 * Tạo nút lá (leaf node) cho cây Huffman
 */
function createLeafNode(symbol: number, weight: bigint): HuffmanNode {
  return {
    weight,
    symbol,            // Byte 0-255
    left: null,
    right: null,
    minSymbol: symbol, // Byte nhỏ nhất trong nhánh này
  };
}

/**
 * Tạo nút cha (internal node) kết hợp 2 nút con
 */
function createParentNode(left: HuffmanNode, right: HuffmanNode): HuffmanNode {
  return {
    weight: left.weight + right.weight,  // Tổng trọng lượng của 2 nhánh
    symbol: null,      // Nút trong không chứa symbol
    left,
    right,
    minSymbol: Math.min(left.minSymbol, right.minSymbol), // Tie-break bằng byte nhỏ nhất
  };
}

/**
 * Xây dựng cây Huffman từ bảng tần suất các byte
 * Thuật toán: sử dụng min-heap để luôn lấy 2 nút có trọng lượng nhỏ nhất
 *
 * @param freq Mảng tần suất 256 phần tử cho các byte 0-255
 * @returns Object chứa root của cây và số lượng symbol có tần suất > 0
 */
export function buildHuffmanTree(freq: Uint32Array): {
  root: HuffmanNode | null;
  symbolCount: number;
} {
  // Bước 1: Tạo các nút lá cho các byte có tần suất > 0
  const leafNodes: HuffmanNode[] = [];
  for (let byteValue = 0; byteValue < 256; byteValue++) {
    if (freq[byteValue] > 0) {
      leafNodes.push(createLeafNode(byteValue, BigInt(freq[byteValue])));
    }
  }
  const symbolCount = leafNodes.length;

  // Trường hợp đặc biệt: file rỗng hoặc chỉ có 1 loại byte
  if (symbolCount === 0) {
    return { root: null, symbolCount: 0 };
  }

  // Bước 2: Tạo min-heap ưu tiên theo weight, sau đó theo minSymbol (tie-breaking)
  const priorityQueue = new MinHeap<HuffmanNode>((nodeA, nodeB) => {
    // So sánh weight trước
    if (nodeA.weight < nodeB.weight) return -1;
    if (nodeA.weight > nodeB.weight) return 1;
    // Nếu weight bằng nhau, so sánh minSymbol để đảm bảo tính ổn định
    if (nodeA.minSymbol < nodeB.minSymbol) return -1;
    if (nodeA.minSymbol > nodeB.minSymbol) return 1;
    return 0;
  });

  // Thêm tất cả leaf nodes vào priority queue
  for (const leafNode of leafNodes) {
    priorityQueue.push(leafNode);
  }

  // Trường hợp đặc biệt: chỉ có 1 symbol
  if (priorityQueue.size() === 1) {
    return { root: priorityQueue.pop(), symbolCount };
  }

  // Bước 3: Xây dựng cây Huffman bằng cách ghép các nút
  // Lặp cho đến khi chỉ còn 1 nút (gốc của cây)
  while (priorityQueue.size() > 1) {
    // Lấy 2 nút có trọng lượng nhỏ nhất
    const leftNode = priorityQueue.pop()!;
    const rightNode = priorityQueue.pop()!;

    // Tạo nút cha và đưa trở lại queue
    const parentNode = createParentNode(leftNode, rightNode);
    priorityQueue.push(parentNode);
  }

  return { root: priorityQueue.pop(), symbolCount };
}
