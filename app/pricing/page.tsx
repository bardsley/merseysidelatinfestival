import React from "react";
// import client from "../../../tina/__generated__/client";
import Layout from "../../components/layout/layout";
import {Section} from "../../components/layout/section";
import Table  from "../../components/ticketing/Table";
import Pricing  from "../../components/ticketing/Pricing";
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
       <section
        className={`flex-1 relative transition duration-150 ease-out body-font overflow-hidden text-white bg-richblack-500 bg-gradient-to-br from-richblack-500 to-richblack-600`}
      > 
        
       <Pricing></Pricing>
        {params.filename }
        {/* <h2 className="text-center text-6xl font-bold uppercase">Old</h2> */}
        {/* <Table></Table> */}
        
      </section>
       
       
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
