import { redirect } from "next/navigation";

// for now redirect to login page going to add a landing page later
export default function Home() {
  redirect("/login");
}
