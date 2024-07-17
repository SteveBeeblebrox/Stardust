export function POST(request) {
    console.log('POST')
}

export function GET(request) {
    return new Response(~~(Math.random()*+(request.args.n)))
}