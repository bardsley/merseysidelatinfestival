import { NextResponse} from 'next/server'

export async function POST(request: Request) {
  console.log(request)
  return NextResponse.json({ generated_at: new Date().toISOString() })
}