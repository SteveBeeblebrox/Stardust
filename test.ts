class HttpError extends Error {
    static readonly ERROR_TEXT = Object.freeze(Object.assign(Object.create(null), {
        404: 'Not found',
        500: 'Internal Server Error'
    }));
    constructor(public readonly code: number, message?: string, cause?: Error) {
        super(message ?? HttpError.ERROR_TEXT[code], {cause});
        this.name = this[Symbol.toStringTag]();
    }
    [Symbol.toStringTag]() {
        return `${this.constructor.name} ${this.code}`;
    }
}

;(function() {
    throw new HttpError(404)
})()