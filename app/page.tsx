import { redirect } from "next/navigation";

export default function Home() {
  redirect("/car-marketplace");
  return null;
}
