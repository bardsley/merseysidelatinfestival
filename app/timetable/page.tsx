"use client";
import React from "react";
// import client from "../../../tina/__generated__/client";
import Layout from "../../components/layout/layout";
import {Section} from "../../components/layout/section";
import Table  from "../../components/ticketing/Table";
// import PostClientPage from "./client-page";

export default function TimetablePage({
  params,
}: {
  params: { filename: string[] };
}) {
  // const data = await client.queries.post({
  //   relativePath: `${params.filename.join("/")}.mdx`,
  // });

  return (
    // <Layout rawPageData={data}>
    <Layout>
       <Section className="">
        <Table></Table>
        {params.filename }
       </Section>
      
      

    </Layout>
  );
}

// export async function generateStaticParams() {
//   const posts = await client.queries.postConnection();
//   const paths = posts.data?.postConnection.edges.map((edge) => ({
//     filename: edge.node._sys.breadcrumbs,
//   }));
//   return paths || [];
// }
