#!/bin/bash
cd `dirname $0`
deno_bindgen -r -o libsdsnoop.ts
cp target/release/libsdsnoop.so .

# sed -i -e 's/abc/LIBPATH/g' sdsnoop.ts


mtsc -p -DDeno=system libsdsnoop.ts