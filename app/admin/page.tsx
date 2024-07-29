import React from "react";
import Layout from "../../components/layout/layout";
import { Container } from "../../components/layout/container";
import Navigation from "../../components/admin/navigation";
import Hub from "../../components/admin/hub";

export default async function AdminDashboardPage() {

  const pages = [
    { name: 'Dashboard', href: '/admin', current: true },
    
  ]
  return (
    <Layout>
      <section className={`flex-1 relative transition duration-150 ease-out body-font overflow-hidden bg-none text-white`}>
        {" "}
        <Container width="large" padding="tight" className={`flex-1 pb-2`} size="top">
          <Navigation pages={pages} />
        </Container>        
        <Container width="large" padding="tight" className={`flex-1 pb-2`} size="none">
          <h1 className="text-2xl md:text-5xl px-4 ">Admin dashboard</h1>
          <p>You will be asked to login to various areas within this section</p>
          <Hub></Hub>
        </Container>
      </section>
    </Layout>
  );
}
