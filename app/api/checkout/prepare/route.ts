// import { cookies } from 'next/headers'
// import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // const data = await request.formData()
  const data = await request.json()
  // console.log(data)
  let response = NextResponse.next()
  // store in a cookie
  response.cookies.set("options", data.selected)
  // Redirect to checkout page
  return NextResponse.json({success: true})
}
