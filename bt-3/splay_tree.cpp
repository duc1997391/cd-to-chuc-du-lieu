#include <iostream>
using namespace std;

struct Node {
  int key;
  Node *left, *right;
  Node(int k) : key(k), left(nullptr), right(nullptr) {}
};

struct SplayTree {
  Node *root;
  SplayTree() : root(nullptr) {}
  void insert(int key);
  void remove(int key);
  Node* search(int key);
  void print();
};

// Right rotate
Node *rightRotate(Node *x) {
  Node *y = x->left;
  x->left = y->right;
  y->right = x;
  return y;
}

// Left rotate
Node *leftRotate(Node *x) {
  Node *y = x->right;
  x->right = y->left;
  y->left = x;
  return y;
}

Node *splayUtil(Node *root, int key) {
  // Base cases: root is nullptr or key is at root
  if (root == nullptr || root->key == key)
    return root;

  // Key lies in left subtree
  if (root->key > key) {
    // Key is not in tree, we are done
    if (root->left == nullptr)
      return root;

    // Zig-Zig (Left Left)
    if (root->left->key > key) {
      // First recursively bring the key as root of left-left
      root->left->left = splayUtil(root->left->left, key);
      // Do first rotation for root
      root = rightRotate(root);
    }
    // Zig-Zag (Left Right)
    else if (root->left->key < key) {
      // First recursively bring the key as root of left-right
      root->left->right = splayUtil(root->left->right, key);
      // Do first rotation for root->left
      if (root->left->right != nullptr)
        root->left = leftRotate(root->left);
    }

    // Do second rotation for root
    return (root->left == nullptr) ? root : rightRotate(root);
  }
  // Key lies in right subtree
  else {
    // Key is not in tree, we are done
    if (root->right == nullptr)
      return root;

    // Zig-Zag (Right Left)
    if (root->right->key > key) {
      // Bring the key as root of right-left
      root->right->left = splayUtil(root->right->left, key);
      // Do first rotation for root->right
      if (root->right->left != nullptr)
        root->right = rightRotate(root->right);
    }
    // Zig-Zig (Right Right)
    else if (root->right->key < key) {
      // Bring the key as root of right-right
      root->right->right = splayUtil(root->right->right, key);
      // Do first rotation for root
      root = leftRotate(root);
    }

    // Do second rotation for root
    return (root->right == nullptr) ? root : leftRotate(root);
  }
}

// Helper function to insert a key (BST insert)
Node *insertBST(Node *node, int key) {
  // If tree is empty, return new node
  if (node == nullptr)
    return new Node(key);

  // Otherwise, recur down the tree
  if (key < node->key)
    node->left = insertBST(node->left, key);
  else if (key > node->key)
    node->right = insertBST(node->right, key);
  // If key already exists, don't insert

  return node;
}

// Insert a key: insert like normal BST, then splay to root
void SplayTree::insert(int key) {
  root = insertBST(root, key);
  root = splayUtil(root, key);
}

Node* SplayTree::search(int key) {
  root = splayUtil(root, key);
  return root->key == key ? root : nullptr;
}

void SplayTree::remove(int key) {
  root = splayUtil(root, key);
  if (root->key == key) {
    Node *left = root->left;
    Node *right = root->right;
    delete root;
    if (!left) {
      root = right;
    } else {
      // find the largest node in the left subtree
      Node *largest = left;
      while (largest->right) {
        largest = largest->right;
      }
      root = splayUtil(left, largest->key);
      root->right = right;
    }
  }
}


void printTree(Node *root, string prefix = "", bool isLeft = true) {
  if (!root)
    return;

  cout << prefix;
  cout << (isLeft ? "├── " : "└── ");
  cout << root->key << endl;

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

void SplayTree::print() {
  if (!root) {
    cout << "Empty tree" << endl;
    return;
  }
  cout << root->key << endl;
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

int main() {
  SplayTree tree;

  tree.insert(10);
  tree.insert(20);
  tree.insert(30);
  tree.insert(40);
  tree.insert(50);
  tree.insert(25);
  cout << "Tree after insertions: " << endl;
  tree.print();

  int input;
  cout << "Enter a key to search: ";
  cin >> input;
  cout << "Searching for " << input << " in tree: " << endl;
  Node* result = tree.search(input);
  if (result) {
    cout << "Node found: " << result->key << endl;
  } else {
    cout << "Node not found" << endl;
  }
  cout << "Tree after searching for " << input << ": " << endl;
  tree.print();

  cout << "Enter a key to remove: ";
  cin >> input;
  cout << "Removing " << input << " from tree: " << endl;
  tree.remove(input);
  cout << "Tree after removing " << input << ": " << endl;
  tree.print();


  return 0;
}
