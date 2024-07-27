import React, { Suspense }from "react";
import Layout from "../../components/layout/layout";
import { Container } from "../../components/layout/container";
// import { IgApiClient } from 'instagram-private-api';
import { InstagramPost } from "./instagramPost";
export default async function InstragePage() {

  // const ig = new IgApiClient();
  // ig.state.generateDevice(process.env.IG_USERNAME);
  // await ig.simulate.preLoginFlow();
  // const loggedInUser = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
  // // // process.nextTick(async () => await ig.simulate.postLoginFlow());
  // const userFeed = ig.feed.user(loggedInUser.pk);
  // const myPostsFirstPage = await userFeed.items();
  // const codes = myPostsFirstPage.map((post) => post.code);
  // // // const myPostsSecondPage = await userFeed.items();
  // // const codes = ["62LoktKkD5", "170xKXLZ3w", "1XExdzKExJ", "0rqmDRrq-O", "0Hj4ojMqMO", "zt3FHSse-N", "ylqz6tMvaA", "ylLEl3M30M", "x0jOxKMRKg", "w8Sb7MK0OC", "tARMXHqQux", "NF7nqdHZwW" ]
  const codes = ["C0rqmDRrq-O"]
  return (
    <Layout>
      <Container className="text-white">
      <h1 className="text-5xl">Hello There</h1>
      {/* <pre>{JSON.stringify(ig.status,null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(loggedInUser,null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(userFeed,null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(myPostsFirstPage || {},null,2)}</pre> */}

      <Suspense>
      {codes.map((code) => (
        <div key={code}>
          <InstagramPost code={code} />

          [{code}]
        </div>
        
      ))}
      </Suspense>
      
      {/* {JSON.stringify(myPostsSecondPage || {})} */}
      </Container>
    </Layout>
  );
}