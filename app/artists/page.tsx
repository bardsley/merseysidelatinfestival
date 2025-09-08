import Layout from "@components/layout/layout";
import client from "@tina/__generated__/client";
import ArtistClientPage from "./client-page";

export default async function ArtistsPage() {
  const artists = await client.queries.artistConnection({
    sort: 'name'
  });

  if (!artists) {
    return null;
  }

  return (
    <Layout rawPageData={artists.data}>
      <ArtistClientPage {...artists} />
    </Layout>
  );
}
