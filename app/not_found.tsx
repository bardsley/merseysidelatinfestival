import { redirect } from "next/navigation";
export default function NotFound() {
  redirect("/404?message=Page not found");
}