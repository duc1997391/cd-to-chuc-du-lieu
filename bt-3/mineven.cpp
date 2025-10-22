#include <iostream>
using namespace std;

struct Node {
  int data;
  Node *left, *right;
  Node(int data) : data(data), left(nullptr), right(nullptr) {}
};

struct BinaryTree {
  Node *root;
  BinaryTree() : root(nullptr) {}
  void insert(int data);
  void print();
};

void BinaryTree::insert(int data) {
  Node *newNode = new Node(data);
  if (!root) {
    root = newNode;
  } else {
    Node *current = root;
    while (current) {
      if (data < current->data) {
        if (!current->left) {
          current->left = newNode;
          break;
        }
        current = current->left;
      } else {
        if (!current->right) {
          current->right = newNode;
          break;
        }
        current = current->right;
      }
    }
  }
}

void printTree(Node *root, string prefix = "", bool isLeft = true) {
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

Node* mineven(Node *root) {
  if (!root) {
    return nullptr;
  }
  // tìm node chẵn nhỏ nhất bên trái
  Node *left = mineven(root->left);
  if (left) {
    return left;
  }
  // nếu node đang xét là node chẵn thì trả về node đó
  if (root->data % 2 == 0) {
    return root;
  }
  // nếu node đang xét không phải là node chẵn thì tiếp tục tìm kiếm bên phải
  return mineven(root->right);
}

int main() {
  BinaryTree tree;
  // insert 10 random numbers
  srand(time(nullptr));
  for (int i = 0; i < 20; i++) {
    tree.insert(rand() % 100);
  }
  tree.print();
  Node *result = mineven(tree.root);
  if (result) {
    cout << "Minimum even number: " << result->data << endl;
  } else {
    cout << "No even number found" << endl;
  }
  return 0;
}
