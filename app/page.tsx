import React from "react";
import client from "@tina/__generated__/client";
import ClientPage from "./[...filename]/client-page";
import Layout from "@components/layout/layout";
export const dynamic = "force-dynamic";
import { unstable_noStore as noStore } from "next/cache";


export default async function Page() {
  noStore();
  const data = await client.queries.page({
    relativePath: `home.mdx`,
  });

  // console.log("PAGE:",params, data.variables);
  return (
    <Layout rawPageData={data}>
      <p className="text-white">root page</p>
      <ClientPage {...data}></ClientPage>
    </Layout>
  );
}

export async function generateStaticParams() {
  const pages = await client.queries.pageConnection();
  console.log("Tina client config", client);
  console.log("Branch:", (client as any).branch);
  console.log("URL:", (client as any).apiUrl);
  console.log("Pages" , pages);
  const paths = pages.data?.pageConnection.edges.map((edge) => ({
    filename: edge.node._sys.breadcrumbs,
  }));
  console.log("PATHS", paths);

  return paths || [];
}
