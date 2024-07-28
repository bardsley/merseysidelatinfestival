import { NextResponse } from 'next/server'
export const revalidate = 300 // revalidate at most every hour

export async function GET() {
  try {
    const fields = ['id','media_type','media_url','thumbnail_url','caption','permalink','children']
    const graphEndpoint = 'media'
    const limit = 4
    const feedUrl = await fetch(`https://graph.instagram.com/me/${graphEndpoint}?limit=${limit}&fields=${fields.join(',')}&access_token=${process.env.IG_TOKEN}`)
    // console.log("feedUrl", feedUrl)
    const instagramPosts = await feedUrl.json()
    // console.log("instagramPosts", instagramPosts)
    const expandedPost = await Promise.all(instagramPosts.data.map(async (post) => {
      if(post.media_type !== 'CAROUSEL_ALBUM') {
        return post
      } else {
        const children = await Promise.all(post.children.data.map(async (child) => {
          const feedUrl = await fetch(`https://graph.instagram.com/${child.id}?fields=${fields.slice(0,-3).join(',')}&access_token=${process.env.IG_TOKEN}`)
          // console.log("feedUrl", feedUrl)
          const instagramPost= await feedUrl.json()
          return instagramPost
        }))
        return {...post, children: children }
      }
    }))

    return NextResponse.json({...{ generated_at: new Date().toISOString() }, instagram_posts: expandedPost}, {status: 200});
    
  } catch (err) {
    return NextResponse.json( { error: err.message, generated_at: new Date().toISOString() }, {status: err.statusCode || 500});
  }
}