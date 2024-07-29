import React from "react";
import Layout from "../../../components/layout/layout";
import { Container } from "../../../components/layout/container";
import Navigation from "../../../components/admin/navigation";
import TicketList from "../../../components/admin/ticketList";

export default async function AdminDashboardPage() {

  const pages = [
    { name: 'Admin', href: '/admin', current: true },
    { name: 'Ticketing', href: '/admin/ticketing', current: true },
  ]
  return (<Layout>
    <section className={`flex-1 relative transition duration-150 ease-out body-font overflow-hidden bg-none text-white`}>
      {" "}
      <Container width="large" padding="tight" className={`flex-1 pb-2`} size="top">
        <Navigation pages={pages} />
      </Container>        
      <Container width="large" padding="tight" className={`flex-1 pb-2`} size="none">
        <h1 className="text-2xl md:text-5xl">Ticketing</h1>
        <p className="">See recent sales, mark as attended and give pass etc</p>
        <TicketList></TicketList>
      </Container>
    </section>
  </Layout>
);
}
