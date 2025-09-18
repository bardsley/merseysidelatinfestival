import Layout from "@components/layout/layout";
import client from "@tina/__generated__/client";
import ArtistClientPage from "./client-page";
export const dynamic = "force-dynamic";
import { unstable_noStore as noStore } from "next/cache";

export default async function ArtistsPage() {
  noStore();
  const artists = await client.queries.artistConnection({
    sort: 'name'
  });

  if (!artists) {
    return <div>Artist Announcements Coming Soon!</div>;
  }

  if (!artists || artists.data?.artistConnection.edges.length === 0) {
    return <Layout rawPageData={artists}>
      <div className="grid grid-cols-11 text-black p-8 gap-0">
        <h1 className="col-span-7 col-start-3 text-center pb-5 pt-24 font-black text-4xl md:text-5xl lg:text-8xl uppercase text-white leading-tight">Artist Announcements Coming Soon!</h1>
      </div>
    </Layout>;
  }

  return (
    <Layout rawPageData={artists.data}>
      <ArtistClientPage {...artists} />
    </Layout>
  );
}
