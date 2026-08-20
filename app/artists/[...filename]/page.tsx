export const revalidate = 60;
export const dynamicParams = true;
// export const dynamic = 'force-dynamic';      // render fresh every request
import React from "react";
import client from "@tina/__generated__/client";
import Layout from "@components/layout/layout";
import ArtistClientPage from "./client-page";
import type { Metadata } from "next";
// import { ArtistQuery } from "@tina/__generated__/types";

export async function generateMetadata({
  params,
}: {
  params: { filename: string[] };
}): Promise<Metadata> {
  const data = await client.queries.artist({
    relativePath: `${params.filename.join("/")}.mdx`,
  });

  return {
    title: data.data.artist.name,
  };
}



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
