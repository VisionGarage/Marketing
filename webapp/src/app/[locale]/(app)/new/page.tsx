import { getAuthContext } from "@/lib/security/guard";
import ProcedureForm from "@/components/ProcedureForm";

export default async function NewProcedurePage() {
  const ctx = await getAuthContext();
  return <ProcedureForm isAdmin={ctx?.profile.role === "admin"} />;
}
