// #include <cmath>
#include <iostream>
using namespace std;

// int main() {
//     string str = "Dưới cầu nước chảy trong veo\nBên cầu tơ liễu bóng chiều thướt tha.\nTruyện Kiều – Nguyễn Du.";
//     cout << str << endl;

//     return 0;
// }

// int main() {
//     cout << "Nhap so nguyen duong n: ";
//     unsigned int n;
//     cin >> n;
//     if (n <= 2) {
//         cout << "So n pah phai lon hon 2" << endl;
//         return 0;
//     }

//     cout << n << " = ";
    
//     bool soDauTien = true;
//     // unsigned int thuong = n;
//     for (unsigned int i = 2; i * i <= n; i++) {
//         while (n % i == 0) {
//             if (soDauTien) {
//                 cout << i;
//             } else {
//                 cout << " * " << i;
//             }
//             n /= i;
//             soDauTien = false;
//         };
//     }
//     if (n > 1) {
//         cout << " * " << n;
//     }
//     cout << endl;

//     return 0;
// }
#include <algorithm>
#include <iostream>
#include <numeric>
#include <random>
#include <string>
#include <vector>

using namespace std;

struct Deck {
    vector<int> cards; // 0..51
    size_t idx = 0;

    void reset() {
        cards.resize(52);
        iota(cards.begin(), cards.end(), 0);
        auto seed = (uint32_t)chrono::high_resolution_clock::now()
                        .time_since_epoch().count();
        mt19937 rng(seed);
        shuffle(cards.begin(), cards.end(), rng);
        idx = 0;
    }
    int draw() { return cards[idx++]; }
};

string cardToString(int c) {
    static string ranks[] = {"A","2","3","4","5","6","7","8","9","10","J","Q","K"};
    static string suits[] = {"♠","♥","♦","♣"}; // nếu máy không hiện Unicode, đổi thành "S","H","D","C"
    int r = c % 13, s = c / 13;
    return ranks[r] + suits[s];
}

int rankValue(int c) {
    int r = c % 13;
    if (r == 0) return 11;     // A
    if (r >= 10) return 10;    // J Q K
    return r + 1;              // 2..10
}

int handValue(const vector<int>& hand) {
    int sum = 0, aces = 0;
    for (int c : hand) {
        sum += rankValue(c);
        if (c % 13 == 0) aces++;
    }
    while (sum > 21 && aces > 0) { sum -= 10; aces--; } // A: 11 -> 1
    return sum;
}

void printHand(const vector<int>& hand, bool hideFirst=false) {
    for (size_t i = 0; i < hand.size(); ++i) {
        if (hideFirst && i == 0) cout << "[??] ";
        else cout << cardToString(hand[i]) << " ";
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cout << "=== Tro choi Xi Dach (Blackjack) ===\n";
    while (true) {
        Deck deck; deck.reset();
        vector<int> player, dealer;

        // chia 2 lá đầu
        player.push_back(deck.draw());
        dealer.push_back(deck.draw());
        player.push_back(deck.draw());
        dealer.push_back(deck.draw());

        cout << "Bai cua ban: "; printHand(player); 
        cout << "  (tong=" << handValue(player) << ")\n";
        cout << "Bai nha cai: "; printHand(dealer, true); cout << "\n";

        int pVal = handValue(player);
        int dVal = handValue(dealer);

        // Blackjack tự nhiên
        if (pVal == 21 || dVal == 21) {
            cout << "--- Kiem tra Blackjack ---\n";
            cout << "Bai nha cai: "; printHand(dealer, false);
            cout << "  (tong=" << dVal << ")\n";
            if (pVal == 21 && dVal == 21)      cout << "Hoa (push). Ca hai deu Blackjack!\n";
            else if (pVal == 21)               cout << "Ban thang voi Blackjack!\n";
            else                                cout << "Nha cai co Blackjack. Ban thua.\n";
        } else {
            // Lượt người chơi
            while (true) {
                cout << "Ban chon (h = rut, s = dung): ";
                char act; if (!(cin >> act)) return 0;
                if (act == 'h' || act == 'H') {
                    int c = deck.draw();
                    player.push_back(c);
                    pVal = handValue(player);
                    cout << "Ban rut: " << cardToString(c) << "\n";
                    cout << "Bai cua ban: "; printHand(player);
                    cout << "  (tong=" << pVal << ")\n";
                    if (pVal > 21) { cout << "Ban QUAC (>21). Ban thua.\n"; break; }
                    if (pVal == 21) { cout << "Ban dat 21!\n"; break; }
                } else if (act == 's' || act == 'S') {
                    cout << "Ban dung.\n"; break;
                } else {
                    cout << "Nhap 'h' hoac 's' nhe.\n";
                }
            }

            // Lượt nhà cái
            if (pVal <= 21) {
                cout << "--- Luot nha cai ---\n";
                cout << "Bai nha cai: "; printHand(dealer); 
                cout << "  (tong=" << dVal << ")\n";
                while (dVal < 17) {
                    int c = deck.draw();
                    dealer.push_back(c);
                    dVal = handValue(dealer);
                    cout << "Nha cai rut: " << cardToString(c) 
                         << "  -> tong=" << dVal << "\n";
                }
                if (dVal > 21) {
                    cout << "Nha cai QUAC (>21). Ban thang!\n";
                } else {
                    cout << "--- Ket qua ---\n";
                    cout << "Ban: " << pVal << "  vs  Nha cai: " << dVal << "\n";
                    if (pVal > dVal)      cout << "Ban thang!\n";
                    else if (pVal < dVal) cout << "Ban thua.\n";
                    else                  cout << "Hoa (push).\n";
                }
            }
        }

        cout << "Choi van moi? (y/n): ";
        char again; if (!(cin >> again)) break;
        if (again != 'y' && again != 'Y') break;
    }

    cout << "Cam on da choi!\n";
    return 0;
}
