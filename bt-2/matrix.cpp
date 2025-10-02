#include <cstdlib>
#include <iostream>
#include <stdlib.h>
using namespace std;

// define a matrix struct and Basic operations methods

struct Matrix {
  int rows;
  int cols;
  int **data;
  Matrix(int rows, int cols);

public:
  Matrix addition(Matrix &other);
  Matrix subtraction(Matrix &other);
  Matrix scalarMultiplication(int scalar);
  Matrix transpose();
  Matrix multiplication(Matrix &other);
  void print();
  void seed();
};

Matrix::Matrix(int rows, int cols) {
  this->rows = rows;
  this->cols = cols;
  this->data = new int *[rows];
  for (int i = 0; i < rows; i++) {
    this->data[i] = new int[cols];
  }
}

Matrix Matrix::addition(Matrix &other) {
  // Để cộng 2 ma trận, chúng phải cùng kích thước
  if (rows != other.rows || cols != other.cols) {
    cout << "Error: Matrix dimensions do not match" << endl;
    return Matrix(rows, cols);
  }
  Matrix result(rows, cols);
  for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
      result.data[i][j] = data[i][j] + other.data[i][j];
    }
  }
  return result;
}

Matrix Matrix::subtraction(Matrix &other) {
  // Để trừ 2 ma trận, chúng phải cùng kích thước
  if (rows != other.rows || cols != other.cols) {
    cout << "Error: Matrix dimensions do not match" << endl;
    return Matrix(rows, cols);
  }
  Matrix result(rows, cols);
  for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
      result.data[i][j] = data[i][j] - other.data[i][j];
    }
  }
  return result;
}

Matrix Matrix::scalarMultiplication(int scalar) {
  Matrix result(rows, cols);
  for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
      result.data[i][j] = data[i][j] * scalar;
    }
  }
  return result;
}

Matrix Matrix::transpose() {
  Matrix result(cols, rows);
  for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
      result.data[j][i] = data[i][j];
    }
  }
  return result;
}

Matrix Matrix::multiplication(Matrix &other){
  // Để nhân 2 ma trận, số cột của ma trận thứ nhất phải bằng số hàng của ma trận thứ hai
  if (cols != other.rows) {
    cout << "Error: Matrix dimensions do not match" << endl;
    return Matrix(0, 0);
  }
  Matrix result(rows, other.cols);
  for (int i = 0; i < rows; ++i)
    for (int j = 0; j < other.cols; ++j)
      for (int k = 0; k < cols; ++k)
        result.data[i][j] += data[i][k] * other.data[k][j];

  return result;
}

void Matrix::print() {
  // Print top border
  cout << "+";
  for (int j = 0; j < cols; j++) {
    cout << "----";
  }
  cout << "+" << endl;
  // Print matrix contents with borders
  for (int i = 0; i < rows; i++) {
    cout << "|";
    for (int j = 0; j < cols; j++) {
      printf("%3d ", data[i][j]); // Right-align numbers with width 3
    }
    cout << "|" << endl;
  }
  // Print bottom border
  cout << "+";
  for (int j = 0; j < cols; j++) {
    cout << "----";
  }
  cout << "+" << endl;
}

void Matrix::seed() {
  for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
      data[i][j] = rand() % 100;
    }
  }
}

void demoMatrixOperations() {
  srand(time(nullptr));
  Matrix matrix1(3, 3);
  matrix1.seed();
  cout << "Matrix 1: " << endl;
  matrix1.print();
  Matrix matrix2(3, 3);
  matrix2.seed();
  cout << "Matrix 2: " << endl;
  matrix2.print();

  cout << "Addition: matrix1 + matrix2 =" << endl;
  Matrix result = matrix1.addition(matrix2);
  result.print();

  cout << "Subtraction: matrix1 - matrix2 =" << endl;
  result = matrix1.subtraction(matrix2);
  result.print();

  cout << "Scalar Multiplication: 2 * matrix1 =" << endl;
  result = matrix1.scalarMultiplication(2);
  result.print();

  cout << "Transpose: matrix1 =" << endl;
  result = matrix1.transpose();
  result.print();

  cout << "Multiplication: matrix1 * matrix2 =" << endl;
  result = matrix1.multiplication(matrix2);
  result.print();
}