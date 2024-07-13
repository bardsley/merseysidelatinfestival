import React from "react";
import client from "../../tina/__generated__/client";
import Layout from "../../components/layout/layout";
// import PricingTable  from "../../components/ticketing/PricingTable";
import ClientPage from "../[...filename]/client-page";

// export default async function TimetablePage({
//   params,
// }: {
//   params: { filename: string[] };
// }) {
export default async function TimetablePage() {
  const data = await client.queries.page({
    relativePath: `pricing.mdx`,
  });

  return (
    <Layout rawPageData={data}>
      <ClientPage {...data}></ClientPage>
       {/* <section
        className={`flex-1 relative transition duration-150 ease-out body-font overflow-hidden text-white bg-richblack-500 bg-gradient-to-br from-richblack-500 to-richblack-600`}
      > 
       <PricingTable></PricingTable>
      </section> */}
      {/* <pre className="text-white">{JSON.stringify(data,null,2)}</pre> */}
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