import { IgApiClient } from 'instagram-private-api';
import { NextResponse } from 'next/server'
export const revalidate = 3600 // revalidate at most every hour


  export async function GET() {
    try {
      const ig = new IgApiClient();
      ig.state.generateDevice(process.env.IG_USERNAME);
      await ig.simulate.preLoginFlow();
      const loggedInUser = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
      // process.nextTick(async () => await ig.simulate.postLoginFlow());
      const userFeed = ig.feed.user(loggedInUser.pk);
      const postsPage = await userFeed.items();

      const instagramBase = 'https://www.instagram.com/p/'
      const instagramPosts = postsPage.map((post) => {
        const baseInfo = {
          id: post.id,
          code: post.code,
          caption: post.caption.text,
          image: post.image_versions2.candidates.map(candidate => candidate.url),
          timestamp: post.taken_at,
          likes: post.like_count,
          comments: post.comment_count,
          link: instagramBase + post.code,
        }
        const videoInfo = post.video_duration && post.video_duration > 0 ? {
          video: post.video_versions.map(video => video.url),
          videoDuration: post.video_duration,
        } : {}
        return {...{generated_at: new Date().toISOString()}, ...baseInfo, ...videoInfo}
      })

      return NextResponse.json(instagramPosts, {status: 200});
      
    } catch (err) {
      return NextResponse.json( { error: err.message, generated_at: new Date().toISOString() }, {status: err.statusCode || 500});
    }
  }