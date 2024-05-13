#!/bin/bash
cd `dirname $0`
deno_bindgen -r -o libsdsnoop.ts > /dev/null

rm ./libsdsnoop.so

sed -i -e 's/"'"$(printf '%s\n' "$(realpath target/release/libsdsnoop.so)" | sed -e 's/[]\/$*.^[]/\\&/g')"'"/\"'$(printf '%s\n' "$(pwd)" | sed -e 's/[\/&]/\\&/g')'\/libsdsnoop.so\"/' libsdsnoop.ts


mv target/release/libsdsnoop.so .

mtsc -p -DDeno=system libsdsnoop.ts