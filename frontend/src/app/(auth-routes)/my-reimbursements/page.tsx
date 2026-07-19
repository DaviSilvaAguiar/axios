import { redirect } from "next/navigation";

export default function Page(): never {
  redirect("/meus-lancamentos?tipo=rcm");
}
