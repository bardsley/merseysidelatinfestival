import Layout from "../../components/layout/layout";
import {Container} from "../../components/layout/container";
import ClientForm from "./client-form";
import { cookies } from "next/headers"

export default async function PreferencesPage() {
  const cookiesStore = cookies()
  const hasCookie = cookiesStore.has("ticket")
  const ticket = cookiesStore.get("ticket")
  return (
    <Layout>
      <Container className="text-white">
        <h1 className="">Preferences</h1>
        <ClientForm hasCookie={hasCookie} ticket={ticket}></ClientForm>
      </Container>
    </Layout>
  );
}
