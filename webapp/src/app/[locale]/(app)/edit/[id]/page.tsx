import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/security/guard";
import type { Procedure } from "@/lib/types";
import ProcedureForm from "@/components/ProcedureForm";

export default async function EditProcedurePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getAuthContext();
  const supabase = await createClient();

  const { data: proc } = await supabase.from("procedures").select("*").eq("id", id).single();
  if (!proc) notFound();
  // Doar proprietarul poate edita.
  if (ctx?.userId !== (proc as Procedure).owner_id) redirect(`/p/${id}`);

  return (
    <ProcedureForm initial={proc as Procedure} isAdmin={ctx?.profile.role === "admin"} />
  );
}
