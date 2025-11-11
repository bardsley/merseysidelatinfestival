export const revalidate = 60;
export const dynamicParams = true;
// export const dynamic = 'force-dynamic';      // render fresh every request
import React from "react";
import client from "@tina/__generated__/client";
import Layout from "@components/layout/layout";
import ArtistClientPage from "./client-page";
// import { ArtistQuery } from "@tina/__generated__/types";



// type ArtistAndClassesQuery = ArtistQuery & { classes: any[] };

export default async function PostPage({
  params,
}: {
  params: { filename: string[] };
}) {
  const data = await client.queries.artist({
    relativePath: `${params.filename.join("/")}.mdx`,
  });
  const classes = await client.queries.classConnection({
    filter: { artist1: { artist: { name: { eq: data.data.artist.name} }  } }, //
  })
  const classData = classes.data.classConnection.edges.map((edge) => {
    return {id: edge.node.id,title: edge.node.title,details: edge.node.details, date: edge.node.date, location: edge.node.location, artist_id: edge.node.artist1.id}
  })

  return (
    <Layout rawPageData={data}>
      <ArtistClientPage {...data} classes={classData}></ArtistClientPage>
      <p suppressHydrationWarning className="text-xs opacity-60">
        renderedAt: {new Date().toISOString()}
      </p>
      <p style={{fontSize:12,opacity:.6}}>
  BRANCH: {process.env.NEXT_PUBLIC_TINA_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || 'main'}
</p>
<p style={{fontSize:12,opacity:.6}}>
  FILE: {data?.data?.artist?._sys?.relativePath}
</p>

    </Layout>
  );
}

export async function generateStaticParams() {
  const artists = await client.queries.artistConnection();
  const paths = artists.data?.artistConnection.edges.map((edge) => ({
    filename: edge.node._sys.breadcrumbs,
  }));
  return paths || [];
}
