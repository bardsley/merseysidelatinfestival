import React from "react";
import Layout from "../../../components/layout/layout";
import { Container } from "../../../components/layout/container";
import Navigation from "../../../components/admin/navigation";
import UserList from "../../../components/admin/userList";
import { currentUser } from "@clerk/nextjs/server";

export default async function AdminUserPage() {

  const pages = [
    { name: 'Admin', href: '/admin', current: true },
    { name: 'Users', href: '/admin/users', current: true },
  ]

  
  const loggedInUser = await currentUser();

  return (<Layout>
    <section className={`flex-1 relative transition duration-150 ease-out body-font overflow-hidden bg-none text-white`}>
      {" "}
      <Container width="large" padding="tight" className={`flex-1 pb-2`} size="top">
        <Navigation pages={pages} />
      </Container>        

      <Container width="large" padding="tight" className={`flex-1 pb-2`} size="none">
      <h1 className="text-2xl md:text-5xl">Users</h1>
      </Container>
      
      <Container width="large" padding="tight" className={`flex-1 pb-2`} size="none">
        <UserList loggedInUser={loggedInUser.id}></UserList>
      </Container>
    </section>
  </Layout>
);
}
