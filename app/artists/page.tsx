import Layout from "../../components/layout/layout";
import client from "../../tina/__generated__/client";
import ArtistClientPage from "./client-page";

export default async function ArtistsPage() {
  const posts = await client.queries.artistConnection();

  if (!posts) {
    return null;
  }

  return (
    <Layout rawPageData={posts.data}>
      <ArtistClientPage {...posts} />
    </Layout>
  );
}
