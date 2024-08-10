import React from "react";
import client from "@tina/__generated__/client";
import ClientPage from "./client-page";
import Layout from "@components/layout/layout";
import { redirect } from 'next/navigation'

export default async function Page({
  params,
}: {
  params: { filename: string[] };
}) {

  // console.log("PAGE:",params);
  try {
    const data = await client.queries.page({
      relativePath: `${params.filename}.mdx`,
    });

    return (
      <Layout rawPageData={data}>
        <ClientPage {...data}></ClientPage>
      </Layout>
    );

  } catch (error) {
    console.log("ERROR", error);
    redirect(`/404?message=Page not found&path=${params.filename.join("/")}`);
  }
  
  
}

export async function generateStaticParams() {
  const pages = await client.queries.pageConnection();
  const paths = pages.data?.pageConnection.edges.map((edge) => ({
    filename: edge.node._sys.breadcrumbs,
  }));
  // console.log("PATHS", paths);

  return paths || [];
}
