import React from "react";
import client from "../../../tina/__generated__/client";
import Layout from "../../../components/layout/layout";
// import ArtistClientPage from "./client-page";

export default async function PostPage({
  params,
}: {
  params: { filename: string[] };
}) {
  const data = await client.queries.artist({
    relativePath: `${params.filename.join("/")}.mdx`,
  });

  return (
    <Layout rawPageData={data}>
      Hello {JSON.stringify(data,null,2)}
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
