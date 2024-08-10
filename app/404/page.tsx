import React from "react";
import client from "@tina/__generated__/client";
import Layout from "@components/layout/layout";
import {Container} from "@components/layout/container";
import { AttemptPath} from "./AttemptedPath"

export default async function FourOhFourPage() {
  const data = await client.queries.page({
    relativePath: `home.mdx`,
  });

  return (
    <Layout rawPageData={data}>
      <Container className="text-white text-center">
        <h1 className="text-5xl">404</h1>
        <p>Sorry we cant find that</p>
        <AttemptPath />
      </Container>
    </Layout>
  );
}

export async function generateStaticParams() {
  const pages = await client.queries.pageConnection();
  const paths = pages.data?.pageConnection.edges.map((edge) => ({
    filename: edge.node._sys.breadcrumbs,
  }));
  return paths || [];
}
