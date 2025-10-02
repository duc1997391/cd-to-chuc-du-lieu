#include <__config>
#include <iostream>
using namespace std;

struct Node {
  int data;
  Node *next;
};

struct LinkList {
  Node *head;

  public:
  void seed(int size);
  void print();
};

void LinkList::seed(int size) {
  std::srand(std::time(nullptr));
  head = nullptr;
  Node *tail;
  for (int i = 0; i < size; i++) {
    Node *newNode = new Node();
    newNode->data = rand() % 10;
    newNode->next = nullptr;
    if (!head) {
      head = newNode;
      tail = newNode;
    } else {
      tail->next = newNode;
      tail = newNode;
    }
  }
}


void LinkList::print() {
  Node *current = head;
  while (current) {
    cout << current->data << " ";
    current = current->next;
  }
  cout << endl;
}

Node *search(Node *head, int value) {
  Node *current = head;
  while (current) {
    if (current->data == value) {
      return current;
    }
    current = current->next;
  }
  return nullptr;
}

Node* searchRec(Node *head, int value) {
  if (!head) {
    return nullptr;
  }
  if (head->data == value) {
    return head;
  }
  return searchRec(head->next, value);
}

void demoLinkList() {
  LinkList list;
  list.seed(10);
  list.print();

  cout << "Searching for node with value 4 using loop" << endl;
  Node *node = search(list.head, 4);
  if (node) {
    cout << "Node found: " << node->data << endl;
  } else {
    cout << "Node not found" << endl;
  }

  cout << "Searching for node with value 8 recursively" << endl;
  Node *nodeRec = searchRec(list.head, 8);
  if (nodeRec) {
    cout << "Node found: " << nodeRec->data << endl;
  } else {
    cout << "Node not found" << endl;
  }
}