import React from "react";
import AuthCheck from "@components/admin/authCheck";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthCheck>
    {children}
  </AuthCheck>

}