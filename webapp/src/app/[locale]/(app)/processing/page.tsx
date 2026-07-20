import { getTranslations } from "next-intl/server";
import ProcessingPanel from "@/components/ProcessingPanel";

export default async function ProcessingPage() {
  const t = await getTranslations("processing");
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-5 font-heading text-3xl text-cream">{t("title")}</h1>
      <ProcessingPanel />
    </div>
  );
}
