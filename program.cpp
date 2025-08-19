#include <cmath>
#include <iostream>
using namespace std;

string formatWithCommas(long long num) {
    string numStr = to_string(num);
    int insertPosition = numStr.length() - 3;
    while (insertPosition > 0) {
        numStr.insert(insertPosition, ",");
        insertPosition -= 3;
    }
    return numStr;
}

string formatWithCommas2(unsigned long long num) {
    string numStr = to_string(num);
    int insertPosition = numStr.length() - 3;
    while (insertPosition > 0) {
        numStr.insert(insertPosition, ",");
        insertPosition -= 3;
    }
    return numStr;
}

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    // cout max size of short
    cout << SHRT_MAX << endl;
    cout << SHRT_MIN << endl;
    cout << USHRT_MAX << endl;
    cout << sizeof(short) << endl;
    cout << sizeof(int) << endl;
    cout << sizeof(long) << endl;
    cout << sizeof(long long) << endl;
    cout << sizeof(float) << endl;
    return 0;
}