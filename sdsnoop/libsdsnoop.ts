// deno-lint-ignore-file

// This file is automatically generated by deno_bindgen.
// Do not edit this file directly.

const { dlopen } = Deno;

const { symbols } = dlopen("/home/siana/Stardust/sdsnoop/libsdsnoop.so", {
  add: {
    parameters: [
      'i32',
      'i32',
    ],
    result: 'i32',
    nonblocking: false
  },
  __Input_new: {
    parameters: [
      'i32',
      'i32',
    ],
    result: 'pointer',
    nonblocking: false
  },
  __Input_dealloc: {
    parameters: [
      'pointer',
    ],
    result: 'void',
    nonblocking: false
  },
  add2: {
    parameters: [
      'pointer',
    ],
    result: 'i32',
    nonblocking: false
  },
  bytelen: {
    parameters: [
      'buffer',
      'usize',
    ],
    result: 'u32',
    nonblocking: false
  },
  buf_mut: {
    parameters: [
      'buffer',
      'usize',
    ],
    result: 'void',
    nonblocking: false
  },
  cstr: {
    parameters: [],
    result: 'pointer',
    nonblocking: false
  },
  strlen: {
    parameters: [
      'pointer',
    ],
    result: 'u32',
    nonblocking: false
  },
  non_blocking: {
    parameters: [],
    result: 'i32',
    nonblocking: true
  },
  make_foo: {
    parameters: [],
    result: 'pointer',
    nonblocking: false
  },
  inc_foo: {
    parameters: [
      'pointer',
    ],
    result: 'void',
    nonblocking: false
  },
  __Foo_new: {
    parameters: [
      'u32',
    ],
    result: 'pointer',
    nonblocking: false
  },
  __Foo_inc: {
    parameters: [
      'pointer',
    ],
    result: 'void',
    nonblocking: false
  },
  __Foo_bar: {
    parameters: [
      'pointer',
      'u32',
    ],
    result: 'u32',
    nonblocking: false
  },
  __Foo_dealloc: {
    parameters: [
      'pointer',
    ],
    result: 'void',
    nonblocking: false
  },
});

export function add(
  arg0: number,
  arg1: number,
): number {
  return symbols.add(
    arg0,
    arg1,
  )
}

function __Input_new(
  arg0: number,
  arg1: number,
): Input {
  const ret = symbols.__Input_new(
    arg0,
    arg1,
  )
  return Input.__constructor(ret);
}

function __Input_dealloc(
  arg0: Deno.PointerObject | null,
): void {
  return symbols.__Input_dealloc(
    arg0,
  )
}

export class Input {
  ptr: Deno.PointerObject | null = null;

  static __constructor(ptr: Deno.PointerObject | null) {
    const self = Object.create(Input.prototype);
    self.ptr = ptr;
    return self;
  }

  [Symbol.dispose]() {
    this.dealloc();
    this.ptr = null;
  }

  constructor(arg0: number, arg1: number) {
    return __Input_new(
      arg0,
      arg1,
    )
  }

  dealloc(): void {
    return __Input_dealloc(
      this.ptr,
    )
  }
}

export function add2(
  arg0: Input,
): number {
  return symbols.add2(
    arg0.ptr,
  )
}

export function bytelen(
  arg0: Uint8Array,
): number {
  return symbols.bytelen(
    arg0,
    arg0.byteLength,
  )
}

export function buf_mut(
  arg0: Uint8Array,
): void {
  return symbols.buf_mut(
    arg0,
    arg0.byteLength,
  )
}

export function cstr(): Deno.PointerObject | null {
  return symbols.cstr()
}

export function strlen(
  arg0: Deno.PointerObject | null,
): number {
  return symbols.strlen(
    arg0,
  )
}

export function non_blocking(): Promise<number> {
  return symbols.non_blocking()
}

export function make_foo(): Foo {
  const ret = symbols.make_foo()
  return Foo.__constructor(ret);
}

export function inc_foo(
  arg0: Foo,
): void {
  return symbols.inc_foo(
    arg0.ptr,
  )
}

function __Foo_new(
  arg0: number,
): Foo {
  const ret = symbols.__Foo_new(
    arg0,
  )
  return Foo.__constructor(ret);
}

function __Foo_inc(
  arg0: Deno.PointerObject | null,
): void {
  return symbols.__Foo_inc(
    arg0,
  )
}

function __Foo_bar(
  arg0: Deno.PointerObject | null,
  arg1: number,
): number {
  return symbols.__Foo_bar(
    arg0,
    arg1,
  )
}

function __Foo_dealloc(
  arg0: Deno.PointerObject | null,
): void {
  return symbols.__Foo_dealloc(
    arg0,
  )
}

export class Foo {
  ptr: Deno.PointerObject | null = null;

  static __constructor(ptr: Deno.PointerObject | null) {
    const self = Object.create(Foo.prototype);
    self.ptr = ptr;
    return self;
  }

  [Symbol.dispose]() {
    this.dealloc();
    this.ptr = null;
  }

  constructor(arg0: number) {
    return __Foo_new(
      arg0,
    )
  }

  inc(): void {
    return __Foo_inc(
      this.ptr,
    )
  }

  bar(arg0: number): number {
    return __Foo_bar(
      this.ptr,
      arg0,
    )
  }

  dealloc(): void {
    return __Foo_dealloc(
      this.ptr,
    )
  }
}

