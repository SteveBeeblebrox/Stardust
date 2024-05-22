#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0" | tee index.js) "$@"; exit $?
//@ts-nocheck
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _PyObject_pyMethodDef;
if ('system' in globalThis) {
    globalThis['Deno'] = globalThis['system'];
}
else {
    globalThis['system'] = globalThis['Deno'];
}
function kwargs(args) {
    return Object.entries(args).map(([k, v]) => new NamedArgument(k, v));
}
const SYMBOLS = {
    Py_Initialize: {
        parameters: [],
        result: "void",
    },
    Py_IncRef: {
        parameters: ["pointer"],
        result: "void",
    },
    Py_DecRef: {
        parameters: ["pointer"],
        result: "void",
    },
    PyImport_ImportModule: {
        parameters: ["buffer"],
        result: "pointer",
    },
    PyRun_SimpleString: {
        parameters: ["buffer"],
        result: "i32",
    },
    PyErr_Occurred: {
        parameters: [],
        result: "pointer",
    },
    PyErr_Clear: {
        parameters: [],
        result: "void",
    },
    PyErr_Fetch: {
        parameters: ["buffer", "buffer", "buffer"],
        result: "void",
    },
    PyDict_New: {
        parameters: [],
        result: "pointer",
    },
    PyDict_SetItemString: {
        parameters: ["pointer", "buffer", "pointer"],
        result: "i32",
    },
    PyObject_GetItem: {
        parameters: ["pointer", "pointer"],
        result: "pointer",
    },
    PyObject_SetItem: {
        parameters: ["pointer", "pointer", "pointer"],
        result: "i32",
    },
    PyObject_DelItem: {
        parameters: ["pointer", "pointer"],
        result: "i32",
    },
    PyObject_Call: {
        callback: true,
        parameters: ["pointer", "pointer", "pointer"],
        result: "pointer",
    },
    PyObject_GetAttrString: {
        parameters: ["pointer", "buffer"],
        result: "pointer",
    },
    PyObject_SetAttrString: {
        parameters: ["pointer", "buffer", "pointer"],
        result: "i32",
    },
    PyObject_HasAttrString: {
        parameters: ["pointer", "buffer"],
        result: "i32",
    },
    PySlice_New: {
        parameters: ["pointer", "pointer", "pointer"],
        result: "pointer",
    },
    PyTuple_New: {
        parameters: ["i32"],
        result: "pointer",
    },
    PyTuple_SetItem: {
        parameters: ["pointer", "i32", "pointer"],
        result: "i32",
    },
    PyObject_RichCompare: {
        parameters: ["pointer", "pointer", "i32"],
        result: "pointer",
    },
    PyObject_RichCompareBool: {
        parameters: ["pointer", "pointer", "i32"],
        result: "i32",
    },
    PyDict_SetItem: {
        parameters: ["pointer", "pointer", "pointer"],
        result: "i32",
    },
    PyIter_Next: {
        parameters: ["pointer"],
        result: "pointer",
    },
    PyObject_GetIter: {
        parameters: ["pointer"],
        result: "pointer",
    },
    PyList_New: {
        parameters: ["i32"],
        result: "pointer",
    },
    PyList_SetItem: {
        parameters: ["pointer", "i32", "pointer"],
        result: "i32",
    },
    PyBool_FromLong: {
        parameters: ["i32"],
        result: "pointer",
    },
    PyFloat_AsDouble: {
        parameters: ["pointer"],
        result: "f64",
    },
    PyFloat_FromDouble: {
        parameters: ["f64"],
        result: "pointer",
    },
    PyLong_AsLong: {
        parameters: ["pointer"],
        result: "i32",
    },
    PyLong_FromLong: {
        parameters: ["i32"],
        result: "pointer",
    },
    PyLong_AsUnsignedLongMask: {
        parameters: ["pointer"],
        result: "u32",
    },
    PyLong_FromUnsignedLong: {
        parameters: ["u32"],
        result: "pointer",
    },
    PyUnicode_AsUTF8: {
        parameters: ["pointer"],
        result: "pointer",
    },
    PyUnicode_DecodeUTF8: {
        parameters: ["buffer", "i32", "pointer"],
        result: "pointer",
    },
    PyList_Size: {
        parameters: ["pointer"],
        result: "i32",
    },
    PyList_GetItem: {
        parameters: ["pointer", "i32"],
        result: "pointer",
    },
    PyObject_Type: {
        parameters: ["pointer"],
        result: "pointer",
    },
    PyObject_Str: {
        parameters: ["pointer"],
        result: "pointer",
    },
    PyDict_Keys: {
        parameters: ["pointer"],
        result: "pointer",
    },
    PyDict_GetItem: {
        parameters: ["pointer", "pointer"],
        result: "pointer",
    },
    PySet_New: {
        parameters: ["pointer"],
        result: "pointer",
    },
    PySet_Add: {
        parameters: ["pointer", "pointer"],
        result: "i32",
    },
    PyImport_ExecCodeModule: {
        parameters: ["buffer", "pointer"],
        result: "pointer",
    },
    PyObject_IsInstance: {
        parameters: ["pointer", "pointer"],
        result: "i32",
    },
    PyDict_GetItemString: {
        parameters: ["pointer", "buffer"],
        result: "pointer",
    },
    PyTuple_Size: {
        parameters: ["pointer"],
        result: "i32",
    },
    PyTuple_GetItem: {
        parameters: ["pointer", "i32"],
        result: "pointer",
    },
    PyCFunction_NewEx: {
        parameters: ["buffer", "pointer", "pointer"],
        result: "pointer",
    },
};
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const libDlDef = {
    dlopen: {
        parameters: ["buffer", "i32"],
        result: "pointer",
    },
};
/**
 * On Unix based systems, we need to supply dlopen with RTLD_GLOBAL
 * but Deno.dlopen does not support passing that flag. So we'll open
 * libc and use its dlopen to open with RTLD_LAZY | RTLD_GLOBAL to
 * allow subsequently loaded shared libraries to be able to use symbols
 * from Python C API.
 */
function postSetup(lib) {
    let libdl;
    if (Deno.build.os === "linux") {
        const libc = Deno.dlopen(`libc.so.6`, {
            gnu_get_libc_version: { parameters: [], result: "pointer" },
        });
        const ptrView = new Deno.UnsafePointerView(libc.symbols.gnu_get_libc_version());
        const glibcVersion = parseFloat(ptrView.getCString());
        libdl = Deno.dlopen(
        // starting with glibc 2.34, libdl is merged into libc
        glibcVersion >= 2.34 ? `libc.so.6` : `libdl.so.2`, libDlDef);
    }
    else if (Deno.build.os === "darwin") {
        libdl = Deno.dlopen(`libc.dylib`, libDlDef);
    }
    else {
        return;
    }
    libdl.symbols.dlopen(cstr(lib), 0x00001 | 0x00100);
}
/**
 * Encodes a C string.
 */
function cstr(str) {
    const buf = new Uint8Array(str.length + 1);
    encoder.encodeInto(str, buf);
    return buf;
}
/**
 * Regular Expression used to test if a string is a `proper_slice`.
 *
 * Based on https://docs.python.org/3/reference/expressions.html#slicings
 */
const SliceItemRegExp = /^\s*(-?\d+)?\s*:\s*(-?\d+)?\s*(:\s*(-?\d+)?\s*)?$/;
const searchPath = [];
const SUPPORTED_VERSIONS = [[3, 12], [3, 11], [3, 10], [3, 9], [3, 8]];
const DENO_PYTHON_PATH = Deno.env.get("DENO_PYTHON_PATH");
if (DENO_PYTHON_PATH) {
    searchPath.push(DENO_PYTHON_PATH);
}
else {
    if (Deno.build.os === "windows" || Deno.build.os === "linux") {
        searchPath.push(...SUPPORTED_VERSIONS.map(([major, minor]) => `${Deno.build.os === "linux" ? "lib" : ""}python${major}${Deno.build.os === "linux" ? "." : ""}${minor}.${Deno.build.os === "linux" ? "so" : "dll"}`));
    }
    else if (Deno.build.os === "darwin") {
        for (const framework of [
            "/Library/Frameworks/Python.framework/Versions",
            "/opt/homebrew/Frameworks/Python.framework/Versions",
            "/usr/local/Frameworks/Python.framework/Versions",
        ]) {
            for (const [major, minor] of SUPPORTED_VERSIONS) {
                searchPath.push(`${framework}/${major}.${minor}/Python`);
            }
        }
    }
    else {
        throw new Error(`Unsupported OS: ${Deno.build.os}`);
    }
}
let py;
for (const path of searchPath) {
    try {
        py = Deno.dlopen(path, SYMBOLS).symbols;
        postSetup(path);
        break;
    }
    catch (err) {
        if (err instanceof TypeError && !("Bun" in globalThis)) {
            throw new Error("Cannot load dynamic library because --unstable flag was not set", { cause: err });
        }
        continue;
    }
}
const LIBRARY_NOT_FOUND = new Error(`
Could not find Python library!

Tried searching for these versions:
${searchPath.map((e) => "  " + e).join("\n")}

Make sure you have a supported version of Python
installed on your system, which should be one of
these: ${SUPPORTED_VERSIONS.map((e) => `${e[0]}.${e[1]}`).join(", ")}

If the module still somehow fails to find it,
you can open an issue: https://github.com/denosaurs/deno_python/issues

However, if your Python distribution is not in search
path, you can set DENO_PYTHON_PATH env variable pointing
to dll/dylib/so file for Python library.
`);
if (typeof py !== "object") {
    throw LIBRARY_NOT_FOUND;
}
const refregistry = new FinalizationRegistry(py.Py_DecRef);
/**
 * Symbol used on proxied Python objects to point to the original PyObject object.
 * Can be used to implement PythonProxy and create your own proxies.
 *
 * See `PyObject#proxy` for more info on proxies.
 */
export const ProxiedPyObject = Symbol("ProxiedPyObject");
/**
 * An argument that can be passed to PyObject calls to indicate that the
 * argument should be passed as a named one.
 *
 * It is allowed to pass named argument like this along with the `named` arg in
 * `PyObject#call` because of the use in proxy objects.
 */
export class NamedArgument {
    constructor(name, value) {
        this.name = name;
        this.value = PyObject.from(value);
    }
}
/**
 * Template Tag to create Keyword Arguments easily
 *
 * Ex:
 *
 * ```ts
 * some_python_function(kw`name=${value}`);
 * ```
 */
export function kw(strings, value) {
    return new NamedArgument(strings[0].split("=")[0].trim(), value);
}
/**
 * Wraps a JS function into Python callback which can be
 * passed to Python land. It must be destroyed explicitly
 * to free up resources on Rust-side.
 *
 * Example:
 * ```ts
 * // Creating
 * const add = new Callback((_, a: number, b: number) => {
 *   return a + b;
 * });
 * // or
 * const add = new Callback((kw: { a: number, b: number }) => {
 *   return kw.a + kw.b;
 * });
 *
 * // Usage
 * some_python_func(add);
 *
 * // Destroy
 * add.destroy();
 * ```
 */
export class Callback {
    constructor(callback) {
        this.callback = callback;
        this.unsafe = new Deno.UnsafeCallback({
            parameters: ["pointer", "pointer", "pointer"],
            result: "pointer",
        }, (_self, args, kwargs) => {
            return PyObject.from(callback(kwargs === null ? {} : Object.fromEntries(new PyObject(kwargs).asDict()
                .entries()), ...(args === null ? [] : new PyObject(args).valueOf()))).handle;
        });
    }
    destroy() {
        this.unsafe.close();
    }
}
/**
 * Represents a Python object.
 *
 * It can be anything, like an int, a string, a list, a dict, etc. and
 * even a module itself.
 *
 * Normally, you will deal with proxied PyObjects, which are basically JS
 * objects but the get, set, etc. methods you perform on them are actually
 * proxied to Python interpreter API.
 *
 * In case you need access to actual PyObject (which this module does too,
 * internally), there's a Symbol on Proxied PyObjects `ProxiedPyObject`
 * that is exported from this module too. It contains reference to `PyObject`.
 *
 * Both proxied PyObject and normal PyObject implement some basic methods like
 * `valueOf`, `toString` and Deno inspect to provide pretty-printing, and also
 * a way to cast Python values as JS types using `valueOf`. For caveats on `valueOf`,
 * see its documentation.
 *
 * Do not construct this manually, as it takes an Unsafe Pointer pointing to the
 * C PyObject.
 */
export class PyObject {
    constructor(handle) {
        this.handle = handle;
        /**
         * A Python callabale object as Uint8Array
         * This is used with `PyCFunction_NewEx` in order to extend its liftime and not allow v8 to release it before its actually used
         */
        _PyObject_pyMethodDef.set(this, void 0);
    }
    /**
     * Check if the object is NULL (pointer) or None type in Python.
     */
    get isNone() {
        // deno-lint-ignore ban-ts-comment
        // @ts-expect-error
        return this.handle === null || this.handle === 0 ||
            this.handle === python.None[ProxiedPyObject].handle;
    }
    /**
     * Increases ref count of the object and returns it.
     */
    get owned() {
        py.Py_IncRef(this.handle);
        refregistry.register(this, this.handle);
        return this;
    }
    /**
     * Creates proxy object that maps basic JS operations on objects
     * such as gets, sets, function calls, has, etc. to Python interpreter API.
     * This makes using Python APIs in JS less cumbersome.
     *
     * Usually, you will deal with proxied PyObjects because they're easier to interact with.
     * If you somehow need the actual `PyObject`, refer to it's documentation.
     *
     * To keep it consistent, proxied objects' further get calls return proxy objects only,
     * so you can safely chain them. But for instance, if you made a call to a method that
     * returns a Python list using proxy object, you can call `.valueOf()` on it to turn it into
     * a JS Array.
     *
     * What you can do on proxy objects:
     *
     * - Call them, if they are a function. An error will be thrown otherwise.
     *
     * - Get their attributes. Such as get `lower` attribute on a `str` object.
     *   This same thing is used to get values of given gets in `dict`s as well.
     *   But the thing is, preference is given to attributes, if its not found,
     *   then we try to look for `dict` key. We could not differentiate normal
     *   property access like something.property with `something[indexed]` in JS,
     *   so they are done on same thing. In case this is not viable for you,
     *   you can call the `get` method on the proxy object, which maps to `dict`'s
     *   `get` method of course.
     *   Just like dicts, this works for lists/tuples too - in order to return
     *   elements based on index.
     *   In special cases, this get accessor returns actual proxy methods,
     *   such as `toString`, `valueOf`, etc. Either way, preference is given to
     *   Python object first. So only if they do not have these attributes,
     *   we return the JS functions.
     *
     * - Set their attributes. Same as the "get" proxy behavior described above,
     *   but instead to set attribute / dict key / list index.
     *
     * - There's also this has accessor on proxy objects, which is basically like
     *   `in` operator in Python. It checks if attribute/dict key exists in the
     *   object.
     */
    get proxy() {
        // deno-lint-ignore no-this-alias
        const scope = this;
        // Not using arrow function here because it disallows
        // `new` operator being used.
        function object(...args) {
            var _a;
            return (_a = scope.call(args)) === null || _a === void 0 ? void 0 : _a.proxy;
        }
        Object.defineProperty(object, Symbol.for("Deno.customInspect"), {
            value: () => this.toString(),
        });
        Object.defineProperty(object, Symbol.for("nodejs.util.inspect.custom"), {
            value: () => this.toString(),
        });
        Object.defineProperty(object, Symbol.toStringTag, {
            value: () => this.toString(),
        });
        Object.defineProperty(object, Symbol.iterator, {
            value: () => this[Symbol.iterator](),
        });
        Object.defineProperty(object, ProxiedPyObject, {
            value: this,
            enumerable: false,
        });
        Object.defineProperty(object, "toString", {
            value: () => this.toString(),
        });
        Object.defineProperty(object, "valueOf", {
            value: () => this.valueOf(),
        });
        // Proxied object must be a function in order for it
        // to be callable. We cannot just define `apply`.
        return new Proxy(object, {
            get: (_, name) => {
                var _a;
                // For the symbols.
                if ((typeof name === "symbol") && name in object) {
                    return object[name];
                }
                if (typeof name === "string" && /^\d+$/.test(name)) {
                    if (this.isInstance(python.list) || this.isInstance(python.tuple)) {
                        const item = py.PyList_GetItem(this.handle, parseInt(name));
                        if (item !== null) {
                            return new PyObject(item).proxy;
                        }
                    }
                }
                if (typeof name === "string" && isSlice(name)) {
                    const slice = toSlice(name);
                    const item = py.PyObject_GetItem(this.handle, slice.handle);
                    if (item !== null) {
                        return new PyObject(item).proxy;
                    }
                }
                // Don't wanna throw errors when accessing properties.
                const attr = (_a = this.maybeGetAttr(String(name))) === null || _a === void 0 ? void 0 : _a.proxy;
                // For non-symbol properties, we prioritize returning the attribute.
                if (attr === undefined) {
                    if (name in object) {
                        return object[name];
                    }
                    else if (typeof name === "string" && this.isInstance(python.dict)) {
                        const value = py.PyDict_GetItemString(this.handle, cstr(name));
                        if (value !== null) {
                            return new PyObject(value).proxy;
                        }
                    }
                }
                else {
                    return attr;
                }
            },
            set: (_, name, value) => {
                name = String(name);
                if (this.hasAttr(name)) {
                    this.setAttr(String(name), value);
                    return true;
                }
                else if (this.isInstance(python.dict)) {
                    py.PyDict_SetItemString(this.handle, cstr(name), PyObject.from(value).handle);
                    return true;
                }
                else if ((this.isInstance(python.list)) && /^\d+$/.test(name)) {
                    py.PyList_SetItem(this.handle, Number(name), PyObject.from(value).handle);
                    return true;
                }
                else if (isSlice(name)) {
                    const slice = toSlice(name);
                    py.PyObject_SetItem(this.handle, slice.handle, PyObject.from(value).handle);
                    return true;
                }
                else {
                    return false;
                }
            },
            has: (_, name) => {
                if (typeof name === "symbol" && name in object) {
                    return true;
                }
                name = String(name);
                return this.hasAttr(name) ||
                    (this.isInstance(python.dict) &&
                        this.proxy.__contains__(name).valueOf()) ||
                    name in object;
            },
        });
    }
    /**
     * Calls Python `isinstance` function.
     */
    isInstance(cls) {
        return py.PyObject_IsInstance(this.handle, PyObject.from(cls).handle) !== 0;
    }
    /**
     * Performs an equals operation on the Python object.
     */
    equals(rhs) {
        const rhsObject = PyObject.from(rhs);
        return py.PyObject_RichCompareBool(this.handle, rhsObject.handle, 3);
    }
    /**
     * Creates a new Python object from the given JS value.
     *
     * Only functions are not supported.
     *
     * @param v JS Value
     * @returns Python object
     */
    static from(v) {
        switch (typeof v) {
            case "boolean": {
                return new PyObject(py.PyBool_FromLong(v ? 1 : 0));
            }
            case "number": {
                if (Number.isInteger(v)) {
                    return new PyObject(py.PyLong_FromLong(v));
                }
                else {
                    return new PyObject(py.PyFloat_FromDouble(v));
                }
            }
            case "bigint": {
                // TODO
                return new PyObject(py.PyLong_FromLong(Number(v)));
            }
            case "object": {
                if (v === null /*or void*/) {
                    return python.builtins.None[ProxiedPyObject];
                }
                else if (ProxiedPyObject in v) {
                    const proxy = v;
                    return proxy[ProxiedPyObject];
                }
                else if (Array.isArray(v)) {
                    const list = py.PyList_New(v.length);
                    for (let i = 0; i < v.length; i++) {
                        py.PyList_SetItem(list, i, PyObject.from(v[i]).owned.handle);
                    }
                    return new PyObject(list);
                }
                else if (v instanceof Callback) {
                    const pyMethodDef = new Uint8Array(8 + 8 + 4 + 8);
                    const view = new DataView(pyMethodDef.buffer);
                    const LE = new Uint8Array(new Uint32Array([0x12345678]).buffer)[0] !== 0x7;
                    const nameBuf = new TextEncoder().encode("JSCallback:" + (v.callback.name || "anonymous") + "\0");
                    view.setBigUint64(0, BigInt(Deno.UnsafePointer.value(Deno.UnsafePointer.of(nameBuf))), LE);
                    view.setBigUint64(8, BigInt(Deno.UnsafePointer.value(v.unsafe.pointer)), LE);
                    view.setInt32(16, 0x1 | 0x2, LE);
                    view.setBigUint64(20, BigInt(Deno.UnsafePointer.value(Deno.UnsafePointer.of(nameBuf))), LE);
                    const fn = py.PyCFunction_NewEx(pyMethodDef, PyObject.from(null).handle, null);
                    // NOTE: we need to extend `pyMethodDef` lifetime
                    // Otherwise V8 can release it before the callback is called
                    const pyObject = new PyObject(fn);
                    __classPrivateFieldSet(pyObject, _PyObject_pyMethodDef, pyMethodDef, "f");
                    return pyObject;
                }
                else if (v instanceof PyObject) {
                    return v;
                }
                else if (v instanceof Set) {
                    const set = py.PySet_New(null);
                    for (const i of v) {
                        const item = PyObject.from(i);
                        py.PySet_Add(set, item.owned.handle);
                        py.Py_DecRef(item.handle);
                    }
                    return new PyObject(set);
                }
                else {
                    const dict = py.PyDict_New();
                    for (const [key, value] of (v instanceof Map ? v.entries() : Object.entries(v))) {
                        const keyObj = PyObject.from(key);
                        const valueObj = PyObject.from(value);
                        py.PyDict_SetItem(dict, keyObj.owned.handle, valueObj.owned.handle);
                        py.Py_DecRef(keyObj.handle);
                        py.Py_DecRef(valueObj.handle);
                    }
                    return new PyObject(dict);
                }
            }
            case "symbol":
            case "string": {
                const str = String(v);
                const encoder = new TextEncoder();
                const u8 = encoder.encode(str);
                return new PyObject(py.PyUnicode_DecodeUTF8(u8, u8.byteLength, null));
            }
            case "undefined": {
                return PyObject.from(null);
            }
            case "function": {
                if (ProxiedPyObject in v) {
                    return v[ProxiedPyObject];
                }
            }
            default:
                throw new TypeError(`Unsupported type: ${typeof v}`);
        }
    }
    /**
     * Tries to get the attribute, returns undefined otherwise.
     *
     * @param name Name of the attribute.
     * @returns Python object
     */
    maybeGetAttr(name) {
        const obj = new PyObject(py.PyObject_GetAttrString(this.handle, cstr(name)));
        if (obj.handle === null) {
            py.PyErr_Clear();
            return undefined;
        }
        else {
            return obj;
        }
    }
    /**
     * Same as maybeGetAttr, but throws an error if the attribute is not found.
     */
    getAttr(name) {
        const obj = this.maybeGetAttr(name);
        if (obj === undefined) {
            throw new Error(`Attribute '${name}' not found`);
        }
        else {
            return obj;
        }
    }
    /**
     * Tries to set the attribute, throws an error otherwise.
     */
    setAttr(name, v) {
        if (py.PyObject_SetAttrString(this.handle, cstr(name), PyObject.from(v).handle) !== 0) {
            maybeThrowError();
        }
    }
    /** Checks if Python object has an attribute of given name. */
    hasAttr(attr) {
        return py.PyObject_HasAttrString(this.handle, cstr(attr)) !== 0;
    }
    /**
     * Casts a Bool Python object as JS Boolean value.
     */
    asBoolean() {
        return py.PyLong_AsLong(this.handle) === 1;
    }
    /**
     * Casts a Int Python object as JS Number value.
     */
    asLong() {
        return py.PyLong_AsLong(this.handle);
    }
    /**
     * Casts a Float (Double) Python object as JS Number value.
     */
    asDouble() {
        return py.PyFloat_AsDouble(this.handle);
    }
    /**
     * Casts a String Python object as JS String value.
     */
    asString() {
        const str = py.PyUnicode_AsUTF8(this.handle);
        return str !== null ? Deno.UnsafePointerView.getCString(str) : null;
    }
    /**
     * Casts a List Python object as JS Array value.
     */
    asArray() {
        const array = [];
        for (const i of this) {
            array.push(i.valueOf());
        }
        return array;
    }
    /**
     * Casts a Dict Python object as JS Map value.
     *
     * Note: `from` supports converting both Map and Object to Python Dict.
     * But this only supports returning a Map.
     */
    asDict() {
        const dict = new Map();
        const keys = py.PyDict_Keys(this.handle);
        const length = py.PyList_Size(keys);
        for (let i = 0; i < length; i++) {
            const key = new PyObject(py.PyList_GetItem(keys, i));
            const value = new PyObject(py.PyDict_GetItem(this.handle, key.handle));
            dict.set(key.valueOf(), value.valueOf());
        }
        return dict;
    }
    *[(_PyObject_pyMethodDef = new WeakMap(), Symbol.iterator)]() {
        const iter = py.PyObject_GetIter(this.handle);
        let item = py.PyIter_Next(iter);
        while (item !== null) {
            yield new PyObject(item);
            item = py.PyIter_Next(iter);
        }
        py.Py_DecRef(iter);
    }
    /**
     * Casts a Set Python object as JS Set object.
     */
    asSet() {
        const set = new Set();
        for (const i of this) {
            set.add(i.valueOf());
        }
        return set;
    }
    /**
     * Casts a Tuple Python object as JS Array value.
     */
    asTuple() {
        const tuple = new Array();
        const length = py.PyTuple_Size(this.handle);
        for (let i = 0; i < length; i++) {
            tuple.push(new PyObject(py.PyTuple_GetItem(this.handle, i))
                .valueOf());
        }
        return tuple;
    }
    /**
     * Tries to guess the value of the Python object.
     *
     * Only primitives are casted as JS value type, otherwise returns
     * a proxy to Python object.
     */
    valueOf() {
        const type = py.PyObject_Type(this.handle);
        if (Deno.UnsafePointer.equals(type, python.None[ProxiedPyObject].handle)) {
            return null;
        }
        else if (Deno.UnsafePointer.equals(type, python.bool[ProxiedPyObject].handle)) {
            return this.asBoolean();
        }
        else if (Deno.UnsafePointer.equals(type, python.int[ProxiedPyObject].handle)) {
            return this.asLong();
        }
        else if (Deno.UnsafePointer.equals(type, python.float[ProxiedPyObject].handle)) {
            return this.asDouble();
        }
        else if (Deno.UnsafePointer.equals(type, python.str[ProxiedPyObject].handle)) {
            return this.asString();
        }
        else if (Deno.UnsafePointer.equals(type, python.list[ProxiedPyObject].handle)) {
            return this.asArray();
        }
        else if (Deno.UnsafePointer.equals(type, python.dict[ProxiedPyObject].handle)) {
            return this.asDict();
        }
        else if (Deno.UnsafePointer.equals(type, python.set[ProxiedPyObject].handle)) {
            return this.asSet();
        }
        else if (Deno.UnsafePointer.equals(type, python.tuple[ProxiedPyObject].handle)) {
            return this.asTuple();
        }
        else {
            return this.proxy;
        }
    }
    /**
     * Call the PyObject as a Python function.
     */
    call(positional = [], named = {}) {
        // count named arguments
        const namedCount = positional.filter((arg) => arg instanceof NamedArgument).length;
        const positionalCount = positional.length - namedCount;
        if (positionalCount < 0) {
            throw new TypeError(`${this.toString()} requires at least ${namedCount} arguments, but only ${positional.length} were passed`);
        }
        const args = py.PyTuple_New(positionalCount);
        let startIndex = 0;
        for (let i = 0; i < positional.length; i++) {
            const arg = positional[i];
            if (arg instanceof NamedArgument) {
                named[arg.name] = arg.value;
            }
            else {
                py.PyTuple_SetItem(args, startIndex++, PyObject.from(arg).owned.handle);
            }
        }
        const kwargs = py.PyDict_New();
        for (const [key, value] of Object.entries(named)) {
            py.PyDict_SetItemString(kwargs, cstr(key), PyObject.from(value).owned.handle);
        }
        const result = py.PyObject_Call(this.handle, args, kwargs);
        py.Py_DecRef(args);
        py.Py_DecRef(kwargs);
        maybeThrowError();
        return new PyObject(result);
    }
    /**
     * Returns `str` representation of the Python object.
     */
    toString() {
        return new PyObject(py.PyObject_Str(this.handle))
            .asString();
    }
    [Symbol.for("Deno.customInspect")]() {
        return this.toString();
    }
    [Symbol.for("nodejs.util.inspect.custom")]() {
        return this.toString();
    }
}
/** Python-related error. */
export class PythonError extends Error {
    constructor(type, value, traceback) {
        var _a;
        let message = (_a = (value !== null && value !== void 0 ? value : type).toString()) !== null && _a !== void 0 ? _a : "Unknown error";
        let stack;
        if (!traceback.isNone) {
            const tb = python.import("traceback");
            stack = tb.format_tb(traceback).valueOf().join("");
            message += stack;
        }
        super(message);
        this.type = type;
        this.value = value;
        this.traceback = traceback;
        this.name = "PythonError";
        this.stack = stack;
    }
}
/**
 * Checks if there's any error set, throws it if there is.
 */
export function maybeThrowError() {
    const error = py.PyErr_Occurred();
    if (error === null) {
        return;
    }
    const pointers = new BigUint64Array(3);
    py.PyErr_Fetch(pointers.subarray(0, 1), pointers.subarray(1, 2), pointers.subarray(2, 3));
    const type = new PyObject(Deno.UnsafePointer.create(pointers[0])), value = new PyObject(Deno.UnsafePointer.create(pointers[1])), traceback = new PyObject(Deno.UnsafePointer.create(pointers[2]));
    throw new PythonError(type, value, traceback);
}
/**
 * Python interface. Do not construct directly, use `python` instead.
 */
export class Python {
    constructor() {
        /** Shortcut to kw function (template string tag) */
        this.kw = kw;
        py.Py_Initialize();
        this.builtins = this.import("builtins");
        this.int = this.builtins.int;
        this.float = this.builtins.float;
        this.str = this.builtins.str;
        this.list = this.builtins.list;
        this.dict = this.builtins.dict;
        this.None = this.builtins.None;
        this.bool = this.builtins.bool;
        this.set = this.builtins.set;
        this.tuple = this.builtins.tuple;
        this.Ellipsis = this.builtins.Ellipsis;
        // Initialize arguments and executable path,
        // since some modules expect them to be set.
        const sys = this.import("sys");
        const os = this.import("os");
        sys.argv = [""];
        if (Deno.build.os === "darwin") {
            sys.executable = os.path.join(sys.exec_prefix, "bin", "python3");
        }
    }
    /**
     * Runs Python script from the given string.
     */
    run(code) {
        if (py.PyRun_SimpleString(cstr(code)) !== 0) {
            throw new EvalError("Failed to run python code");
        }
    }
    /**
     * Runs Python script as a module and returns its module object,
     * for using its attributes, functions, classes, etc. from JavaScript.
     */
    runModule(code, name) {
        var _a;
        const module = py.PyImport_ExecCodeModule(cstr(name !== null && name !== void 0 ? name : "__main__"), PyObject.from(this.builtins.compile(code, name !== null && name !== void 0 ? name : "__main__", "exec"))
            .handle);
        if (module === null) {
            throw new EvalError("Failed to run python module");
        }
        return (_a = new PyObject(module)) === null || _a === void 0 ? void 0 : _a.proxy;
    }
    /**
     * Import a module as PyObject.
     */
    importObject(name) {
        const mod = py.PyImport_ImportModule(cstr(name));
        if (mod === null) {
            maybeThrowError();
            throw new TypeError(`Failed to import module ${name}`);
        }
        return new PyObject(mod);
    }
    /**
     * Import a Python module as a proxy object.
     */
    import(name) {
        return this.importObject(name).proxy;
    }
    /** Shortcut to create Callback instance. */
    callback(cb) {
        return new Callback(cb);
    }
}
/**
 * Python interface.
 *
 * Most of the time, you will use `import` on this object,
 * and also make use of some common built-ins attached to
 * this object, such as `str`, `int`, `tuple`, etc.
 */
export const python = new Python();
/**
 * Returns true if the value can be converted into a Python slice or
 * slice tuple.
 */
function isSlice(value) {
    if (typeof value !== "string")
        return false;
    if (!value.includes(":") && !value.includes("..."))
        return false;
    return value
        .split(",")
        .map((item) => (SliceItemRegExp.test(item) || // Slice
        /^\s*-?\d+\s*$/.test(item) || // Number
        /^\s*\.\.\.\s*$/.test(item) // Ellipsis
    ))
        .reduce((a, b) => a && b, true);
}
/**
 * Returns a PyObject that is either a slice or a tuple of slices.
 */
function toSlice(sliceList) {
    if (sliceList.includes(",")) {
        const pySlicesHandle = sliceList.split(",").map(toSlice);
        return python.tuple(pySlicesHandle)[ProxiedPyObject];
    }
    else if (/^\s*-?\d+\s*$/.test(sliceList)) {
        return PyObject.from(parseInt(sliceList));
    }
    else if (/^\s*\.\.\.\s*$/.test(sliceList)) {
        return PyObject.from(python.Ellipsis);
    }
    else {
        const [start, stop, step] = sliceList
            .split(":")
            .map((bound) => (/^\s*-?\d+\s*$/.test(bound) ? parseInt(bound) : undefined));
        const pySliceHandle = py.PySlice_New(PyObject.from(start).handle, PyObject.from(stop).handle, PyObject.from(step).handle);
        return new PyObject(pySliceHandle);
    }
}
const { BPF } = python.import('bcc');
const { connect } = python.runModule(`
def connect(program,callback,page_cnt=64):
    program["events"].open_perf_buffer(
        lambda cpu,data,size: callback(program["events"].event(data)),
        page_cnt=page_cnt
    );
`);
// https://www.man7.org/linux/man-pages/man7/bpf-helpers.7.html
let srcText = `
#include <linux/kconfig.h>
#include <uapi/linux/ptrace.h>
#include <uapi/linux/limits.h>
#include <linux/sched.h>
#include <linux/fs_struct.h>
#include <linux/dcache.h>

#define MAX_ENTRIES 32

enum event_type {
    EVENT_ENTRY,
    EVENT_END,
};

struct data_t {
    u8 valid;
    u64 id; //[pid tid]
    u64 ts;
    u32 uid;
    u32 nspid;
    int ret;
    char comm[TASK_COMM_LEN];
    enum event_type type;
    char name[NAME_MAX];
    int flags;
};

BPF_PERF_OUTPUT(events);

static struct data_t collect_data(const char __user *filename, int flags, int ret) {
    struct data_t data = {};

    u64 id = bpf_get_current_pid_tgid();
    u64 tsp = bpf_ktime_get_ns();

    struct bpf_pidns_info ns = {};
    if(bpf_get_ns_current_pid_tgid(%%DEV%%, %%INO%%, &ns, sizeof(struct bpf_pidns_info)))
    	return data;
    
    data.valid = 1;
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    bpf_probe_read_user_str(&data.name, sizeof(data.name), (void *)filename);
    data.id = id;
    data.ts = tsp / 1000;
    data.uid = bpf_get_current_uid_gid();
    data.nspid = ns.pid;
    data.flags = flags;
    // data.ret = ret;

    return data;
}

#if defined(CONFIG_ARCH_HAS_SYSCALL_WRAPPER) && !defined(__s390x__)
KRETFUNC_PROBE(%%fn_open%%, struct pt_regs *regs, int ret) {
    const char __user *filename = (char *)PT_REGS_PARM1(regs);
    int flags = PT_REGS_PARM2(regs);
#else
KRETFUNC_PROBE(%%fn_open%%, const char __user *filename, int flags, int ret) {
#endif
    struct data_t data = collect_data(filename, flags, ret);

    %%SUBMIT_DATA%%

    return 0;
}

#if defined(CONFIG_ARCH_HAS_SYSCALL_WRAPPER) && !defined(__s390x__)
KRETFUNC_PROBE(%%fn_openat%%, struct pt_regs *regs, int ret) {
    int dfd = PT_REGS_PARM1(regs);
    const char __user *filename = (char *)PT_REGS_PARM2(regs);
    int flags = PT_REGS_PARM3(regs);
#else
KRETFUNC_PROBE(%%fn_openat%%, int dfd, const char __user *filename, int flags, int ret) {
#endif
    struct data_t data = collect_data(filename, flags, ret);

    %%SUBMIT_DATA%%

    return 0;
}

#ifdef OPENAT2
#include <uapi/linux/openat2.h>
#if defined(CONFIG_ARCH_HAS_SYSCALL_WRAPPER) && !defined(__s390x__)
KRETFUNC_PROBE(%%fn_openat2%%, struct pt_regs *regs, int ret) {
    int dfd = PT_REGS_PARM1(regs);
    const char __user *filename = (char *)PT_REGS_PARM2(regs);
    struct open_how __user how;
    int flags;

    bpf_probe_read_user(&how, sizeof(struct open_how), (struct open_how*)PT_REGS_PARM3(regs));
    flags = how.flags;
#else
KRETFUNC_PROBE(%%fn_openat2%%, int dfd, const char __user *filename, struct open_how __user *how, int ret) {
    int flags = how->flags;
#endif
    struct data_t data = collect_data(filename, flags, ret);

    %%SUBMIT_DATA%%

    return 0;
}
#endif
`;
const devinfo = await system.stat('/proc/self/ns/pid');
const emptyBPF = new BPF(...kwargs({ text: '' }));
const syscallPrefix = emptyBPF.get_syscall_prefix().decode();
const parameters = {
    DEV: devinfo.dev,
    INO: devinfo.ino,
    // open and openat are always in place since 2.6.16
    fn_open: syscallPrefix + 'open',
    fn_openat: syscallPrefix + 'openat',
    fn_openat2: syscallPrefix + 'openat2',
    SUBMIT_DATA: `
    data.type = EVENT_ENTRY;
    events.perf_submit(ctx, &data, sizeof(data));

    if (data.name[0] != '/') { // Only need to expand relative paths
        struct task_struct *task;
        struct dentry *dentry;
        int i;

        task = (struct task_struct *)bpf_get_current_task_btf();
        dentry = task->fs->pwd.dentry;

        for (i = 1; i < MAX_ENTRIES; i++) {
            bpf_probe_read_kernel(&data.name, sizeof(data.name), (void *)dentry->d_name.name);
            data.type = EVENT_ENTRY;
            events.perf_submit(ctx, &data, sizeof(data));

            if (dentry == dentry->d_parent) { // At root directory
                break;
            }

            dentry = dentry->d_parent;
        }
    }

    data.type = EVENT_END;
    events.perf_submit(ctx, &data, sizeof(data));
    ` // The compiler won't let this be a macro since it includes bcc map calls
};
for (const [key, value] of Object.entries(parameters)) {
    srcText = srcText.replaceAll(`%%${key}%%`, value);
}
if (+(emptyBPF.ksymname(parameters.fn_openat2)) != -1) {
    program_text = '#define OPENAT2\n' + program_text;
}
system.writeTextFileSync('out.c', srcText);
const program = new BPF(...kwargs({ text: srcText }));
connect(program, new Callback(function (kwargs, event) {
    console.log(event.name.decode());
}), 64);
while (true) {
    program.perf_buffer_poll();
}
