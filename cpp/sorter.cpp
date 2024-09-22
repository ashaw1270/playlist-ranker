#include <iostream>
#include <string>
#include <vector>

using namespace std;

int prompt(string song1, string song2) {
    cout << "Song 1: " << song1 << " or Song 2: " << song2 << "? ";
    int choice;
    cin >> choice;
    return choice;
}

vector<string> sort(vector<string>& songs) {
    vector<string> sorted;
    for (string song : songs) {
        if (sorted.empty()) {
            sorted.push_back(song);
            continue;
        }

        int low = 0, high = sorted.size() - 1;
        while (low <= high) {
            int mid = (low + high) / 2;
            int choice = prompt(song, sorted[mid]);
            if (choice == 1) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        sorted.insert(sorted.begin() + low, song);
    }
    return sorted;
}

vector<string> getSongs() {
    vector<string> songs;
    cout << "Enter songs:" << endl;
    string song;
    getline(cin, song);
    while (song != "done") {
        songs.push_back(song);
        getline(cin, song);
    }
    return songs;
}

void printSongs(vector<string>& songs) {
    for (int i = 0; i < songs.size(); i++) {
        cout << i + 1 << ": " << songs[i] << endl;
    }
}

int main() {
    cout << endl;
    vector<string> songs = getSongs();
    cout << endl;
    vector<string> sorted = sort(songs);
    cout << endl;
    printSongs(sorted);
    cout << endl;
}