#include <iostream>
using namespace std;

// class Node {
//   public:
//   Node *next;
//   Node *prev;
//   int data;
//   Node(int data) : data(data), next(nullptr), prev(nullptr) {}
// };

// struct Deque {
//   Node *head;
//   Node *tail;
//   int size;
//   Deque() : head(nullptr), tail(nullptr), size(0) {}
//   void push_back(int data);
//   void push_front(int data);
//   int pop_back(); // fixed: replace Nullable<int> with int
//   int pop_front(); // fixed: replace Nullable<int> with int
  
//   void print();
// };

// void Deque::push_back(int data) {
//   Node *newNode = new Node(data);
//   if (head == nullptr) {
//     head = newNode;
//     tail = newNode;
//   } else {
//     tail->next = newNode;
//     newNode->prev = tail;
//     tail = newNode;
//   }
//   size++;
// };

// void Deque::push_front(int data) {
//   Node *newNode = new Node(data);
//   if (head == nullptr) {
//     head = newNode;
//     tail = newNode;
//   } else {
//     newNode->next = head;
//     head->prev = newNode;
//     head = newNode;
//   }
//   size++;
// };

// int Deque::pop_back() {
//   if (size == 0) {
//     throw runtime_error("Deque is empty");
//   }
//   int value = tail->data;
//   if (tail->prev == nullptr) {
//     head = nullptr;
//     tail = nullptr;
//   } else {
//     tail = tail->prev;
//     delete tail->next;
//     tail->next = nullptr;
//   }
//   size--;
//   return value;
// }

// int Deque::pop_front() {
//   if (size == 0) {
//     throw runtime_error("Deque is empty");
//   }
//   int value = head->data;
//   if (head->next == nullptr) {
//     head = nullptr;
//     tail = nullptr;
//   }
//   else {
//     head = head->next;
//     delete head->prev;
//     head->prev = nullptr;
//   }
//   size--;
//   return value;
// }

// void Deque::print() {
//   Node *current = head;
//   while (current) {
//     cout << current->data << " ";
//     current = current->next;
//   }
//   cout << endl;
// }

// void demoPush(Deque &deque, bool isFront = true) {
//   int randomValue = rand() % 100;
//   cout << "Pushing " << randomValue << " to " << (isFront ? "front" : "back") << endl;
//   if (isFront) {
//     deque.push_front(randomValue);
//   } else {
//     deque.push_back(randomValue);
//   }
// }

// int main() {
//   Deque deque;
//   for (int i = 0; i < 10; i++) {
//     demoPush(deque, true);
//   }
//   deque.print();
//   for (int i = 0; i < 10; i++) {
//     demoPush(deque, false);
//   }
//   deque.print();
//   cout << "Pop back: " << deque.pop_back() << endl;
//   cout << "Pop front: " << deque.pop_front() << endl;
//   deque.print();
//   cout << "Pop back: " << deque.pop_back() << endl;
//   cout << "Pop front: " << deque.pop_front() << endl;
//   deque.print();
//   cout << "Pop back: " << deque.pop_back() << endl;
//   cout << "Pop front: " << deque.pop_front() << endl;
//   deque.print();
//   cout << "Pop back: " << deque.pop_back() << endl;
//   cout << "Pop front: " << deque.pop_front() << endl;
//   deque.print();
//   return 0;
// }


// struct NODE {
//   int data;
//   NODE *next;
// };

// struct LinkList {
//   NODE *head;
//   LinkList() : head(nullptr) {}
//   void seed(int size);
//   void print();
// };

// void LinkList::seed(int size) {
//   std::srand(std::time(nullptr));
  
//   for (int i = 0; i < size; i++) {
//     NODE *newNode = new NODE();
//     newNode->data = rand() % 10;
//     newNode->next = head;
//     head = newNode;
//   }
// }

// void LinkList::print() {
//   NODE *current = head;
//   while (current != nullptr) {
//     cout << current->data << " ";
//     current = current->next;
//   }
//   cout << endl;
// }

// NODE* search(NODE *head, int k) {
//   NODE *current = head;
//   while (current != nullptr) {
//     if (current->data == k)
//       return current;
//     current = current->next;
//   }
//   return nullptr;
// }

// NODE* searchRec(NODE *head, int k) {
//   if (head == nullptr) {
//     return nullptr;
//   }
//   if (head->data == k) {
//     return head;
//   }

//   return searchRec(head->next, k);
// }

// int main() {
//   LinkList list;
//   list.seed(10);
//   list.print();
//   cout << "Searching for node with value 4 using loop" << endl;
//   NODE *node = search(list.head, 4);
//   if (node) {
//     cout << "Node found: " << node->data << endl;
//   } else {
//     cout << "Node not found" << endl;
//   }
//   cout << "Searching for node with value 8 recursively" << endl;
//   NODE *nodeRec = searchRec(list.head, 8);
//   if (nodeRec) {
//     cout << "Node found: " << nodeRec->data << endl;
//   } else {
//     cout << "Node not found" << endl;
//   }
//   return 0;
// }

struct NODE {
  int data;
  NODE *left, *right;
  NODE(int data) : data(data), left(nullptr), right(nullptr) {}
};

struct BinaryTree {
  NODE *root;
  BinaryTree() : root(nullptr) {}
  void insert(int data);
  void print();
};

void BinaryTree::insert(int data) {
  NODE *newNode = new NODE(data);
  if (root == nullptr) {
    root = newNode;
  }
  else {
    NODE *current = root;
    while (current) {
      if (data < current->data) {
        if (current->left == nullptr) {
          current->left = newNode;
          break;
        } else {
          current = current->left;
        }
      } else {
        if (current->right == nullptr) {
          current->right = newNode;
          break;
        } else {
          current = current->right;
        }
      }
    }
  }
}

void printTree(NODE *root, string prefix = "", bool isLeft = true) {
  if (!root)
    return;

  cout << prefix;
  cout << (isLeft ? "├── " : "└── ");
  cout << root->data << endl;

  if (root->left || root->right) {
    if (root->left) {
      printTree(root->left, prefix + (isLeft ? "│   " : "    "), true);
    } else if (root->right) {
      cout << prefix << (isLeft ? "│   " : "    ") << "├── "
           << "null" << endl;
    }

    if (root->right) {
      printTree(root->right, prefix + (isLeft ? "│   " : "    "), false);
    }
  }
}

void BinaryTree::print() {
  if (!root) {
    cout << "Empty tree" << endl;
    return;
  }
  cout << root->data << endl;
  if (root->left) {
    printTree(root->left, "", true);
  } else if (root->right) {
    cout << "├── null" << endl;
  }
  if (root->right) {
    printTree(root->right, "", false);
  }
  cout << "--------------------------------" << endl;
};

NODE* mineven(NODE *root) {
  if (root == nullptr) {
    return nullptr;
  }
  NODE *left = mineven(root->left);
  if (left) return left;
  if (root->data % 2 == 0) return root;
  return mineven(root->right);
}

NODE* maxodd(NODE *root) {
  if (root == nullptr) {
    return nullptr;
  }
  NODE *right = maxodd(root->right);
  if (right) return right;
  if (root->data % 2 != 0) return root;
  return maxodd(root->left);
}

int main() {
  srand(time(nullptr));
  BinaryTree tree;
  for (int i = 0; i < 20; i++) {
    tree.insert(rand() % 100);
  }
  tree.print();
  NODE *result = mineven(tree.root);
  cout << "Minimum even number: " << result->data << endl;
  result = maxodd(tree.root);
  cout << "Maximum odd number: " << result->data << endl;
  return 0;
}