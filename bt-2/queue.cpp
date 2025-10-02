#include <vector>
#include <iostream>
using namespace std;


struct Deque {
  vector<int> data;

  void push_back(int value);
  void push_front(int value);
  int pop_back();
  int pop_front();
  int size();
  int front();
  int back();
  void print();
};

void Deque::push_back(int value) {
  data.push_back(value);
}

void Deque::push_front(int value) {
  data.insert(data.begin(), value);
}

int Deque::pop_back() {
  int value = data.back();
  data.pop_back();
  return value;
}   

int Deque::pop_front() {
  int value = data.front();
  data.erase(data.begin());
  return value;
}

int Deque::size() {
  return data.size();
}

int Deque::front() {
  return data.front();
}

int Deque::back() {
  return data.back();
}

void Deque::print() {
  for (int i = 0; i < data.size(); i++) {
    cout << data[i] << " ";
  }
  cout << endl;
}

void demoDequeOperations() {
  Deque deque;
  deque.push_back(1);
  deque.push_back(2);
  deque.push_back(3);
  deque.push_back(4);
  deque.push_back(5);
  deque.print();
  deque.push_front(0);
  cout << "After push_front: 0" << endl;
  deque.print();
  deque.pop_back();
  cout << "After pop_back" << endl;
  deque.print();
  deque.pop_front();
  cout << "After pop_front" << endl;
  deque.print();
}