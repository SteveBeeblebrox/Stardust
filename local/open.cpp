//$(which g++) $0 -o ${out=$(mktemp)} || exit && exec $out "$@"

#include <fstream>
#include <iostream>

using namespace std;

int main() {
    fstream stream("file.txt", ios::out);
    while(true);
    return 0;
}