import React, { Suspense } from "react";
import Layout from "@components/layout/layout";
import { Container } from "@components/layout/container";
import Navigation from "@components/admin/navigation";
import TicketList from "@components/admin/ticketList";
import StatBlock, {StatLine} from "@components/admin/statBlock";
import { admin_ticketing_url } from "@lib/urls";

export default async function AdminDashboardPage() {

  const pages = [
    { name: 'Admin', href: '/admin', current: true },
    { name: 'Ticketing', href: admin_ticketing_url, current: true },
  ]

  const stats = [
    { name: 'Total', value: '405', unit: 'tickets' },
    { name: 'Today', value: '10', unit: 'tickets' },
    { name: 'Meal prefs', value: '3', unit: 'set' },
    { name: 'Dinner Prefs', value: '2.5%', unit: 'complete' },
  ] as StatLine[]

  return (<Layout>
    <section className={`flex-1 relative transition duration-150 ease-out body-font overflow-hidden bg-none text-white`}>
      {" "}
      <Container width="large" padding="tight" className={`flex-1 pb-2`} size="top">
        <Navigation pages={pages} />
      </Container>        

      <Container width="large" padding="tight" className={`flex-1 pb-2`} size="none">
      <h1 className="text-2xl md:text-5xl">Ticketing</h1>
      <p className="">See recent sales, mark as attended and give pass etc</p>
      </Container>
      <Container width="large" padding="tight" className={`flex-1 pb-2`} size="none">
        <StatBlock stats={stats}></StatBlock>
      </Container>
      
      <Container width="large" padding="tight" className={`flex-1 pb-2`} size="none">
        <Suspense>
          <TicketList></TicketList>
        </Suspense>
      </Container>
    </section>
  </Layout>
);
}
