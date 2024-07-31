import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
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
          <SignedOut>
            <div className='flex'>
              <div>
                <h2>Have an account</h2>
                <p>Fantastic, just login below</p>
                <SignInButton />
              </div>
              <div>
                <h2>Need an account</h2>
                <p>Signup here and then an existing admin will give your privaleges</p>
                <a href="/admin/sign-up">
                  Signup
                </a>
              </div>
            </div>
            

          </SignedOut>
          <SignedIn>
            <UserButton />
              <Hub></Hub>
          </SignedIn>
          
        </Container>
      </section>
    </Layout>
  )
}
