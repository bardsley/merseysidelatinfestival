import React from "react";
import Layout from "@components/layout/layout";
import { Container } from "@components/layout/container";
import Navigation from "@components/admin/navigation";
import TicketView from "@components/admin/ticket";
import { admin_ticketing_url } from "../../../../../../lib/urls";

export default async function AdminTicketPage({ params }: { params: { ticket_number: string, email: string } }) {

  const pages = [
    { name: 'Admin', href: '/admin', current: true },
    { name: 'Ticketing', href: admin_ticketing_url, current: true },
    { name: 'View Ticket', href: `/admin/ticketing/${params.ticket_number}/${params.email}`, current: true },
  ]

  return (<Layout>
    <section className={`flex-1 relative transition duration-150 ease-out body-font overflow-hidden bg-none text-white`}>
      {" "}
      <Container width="large" padding="tight" className={`flex-1 pb-2`} size="top">
        <Navigation pages={pages} />
      </Container>             
      
      <Container width="large" padding="tight" className={`flex-1 pb-2`} size="none">
        <TicketView ticket_number={params.ticket_number} email={params.email}  ></TicketView>
      </Container>
    </section>
  </Layout>
);
}
