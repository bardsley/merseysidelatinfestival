import {
  SignedIn,
} from '@clerk/nextjs'
import React from "react";
import Layout from "@components/layout/layout";
import { Container } from "@components/layout/container";
import Navigation from "@components/admin/navigation";
import StripePageClient from  "./stripe-client";

export default async function AdminStripePage() {

  const pages = [
    { name: 'Dashboard', href: '/admin', current: true },
    { name: 'Stripe', href: '/admin/stripe', current: true },
  ]
  return (
    <Layout>
      <section className={`flex-1 relative transition duration-150 ease-out body-font overflow-hidden bg-none text-white`}>
        {" "}
        <Container width="large" padding="tight" className={`flex-1 pb-2`} size="top">
          <Navigation pages={pages} />
        </Container>        
        <Container width="large" padding="tight" className={`flex-1 pb-2`} size="none">
          <SignedIn>
              <div className='flex align-baseline'>
                <h1 className="text-2xl md:text-5xl px-4 ">Stripe</h1>
              </div>
              
              <StripePageClient/>

              
          </SignedIn>
        </Container>
      </section>
    </Layout>
  )
}
