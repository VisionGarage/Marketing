import { getTranslations } from "next-intl/server";
import LibraryBrowser from "@/components/LibraryBrowser";

export default async function LibraryPage() {
  const t = await getTranslations("library");
  return (
    <div>
      <h1 className="mb-5 font-heading text-3xl text-cream">{t("title")}</h1>
      <LibraryBrowser />
    </div>
  );
}
