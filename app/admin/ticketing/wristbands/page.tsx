import React from "react";
import Layout from "@components/layout/layout";
import { Container } from "@components/layout/container";
import Navigation from "@components/admin/navigation";
import { admin_ticketing_url } from "@lib/urls";
import WristbandsClient from "./wristbands-client";

const pages = [
  { name: 'Admin', href: '/admin' },
  { name: 'Ticketing', href: admin_ticketing_url },
  { name: 'Wristbands', href: '/admin/ticketing/wristbands', current: true },
]

export default async function AdminWristbandsPage() {
  return (<Layout>
    <section className={`flex-1 relative transition duration-150 ease-out body-font overflow-hidden bg-none text-white`}>
      {" "}
      <Container width="large" padding="tight" className={`flex-1 pb-2`} size="top">
        <Navigation pages={pages} />
      </Container>
      <Container width="large" padding="tight" className={`flex-1 pb-2`} size="none">
        <h1 className="text-2xl md:text-5xl">Wristbands</h1>
        <p>How many of each wristband / stamp / ticket we need, based on the same checks used when scanning people in.</p>
      </Container>
      <Container width="large" padding="tight" className={`flex-1 pb-2`} size="none">
        <WristbandsClient />
      </Container>
    </section>
  </Layout>
);
}
