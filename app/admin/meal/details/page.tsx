import React from "react";
import Layout from "@components/layout/layout";
import { Container } from "@components/layout/container";
import Navigation from "@components/admin/navigation";
import DetailsPageClient from "./details-client";

// import { currentUser } from "@clerk/nextjs/server";

const pages = [
  { name: 'Admin', href: '/admin' },
  { name: 'Dining', href: '/admin/dining', current: true },
]

export default async function AdminUserPage() {
  // const loggedInUser = await currentUser();
  
  return (<Layout>
    <section className={`flex-1 relative transition duration-150 ease-out body-font overflow-hidden bg-none text-white`}>
      {" "}
      <Container width="large" padding="tight" className={`flex-1 pb-2 breadcrumbs`} size="top">
        <Navigation pages={pages} />
      </Container>        
      <Container width="custom" padding="tight" className={`flex-1 pb-2 w-full page`} size="none">
        <DetailsPageClient />
      </Container>
    </section>
  </Layout>
);
}